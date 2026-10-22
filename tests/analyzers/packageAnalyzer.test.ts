import { describe, it, expect, beforeEach } from 'vitest';
import { resolve } from 'node:path';
import { PackageAnalyzer } from '../../src/analyzers/packageAnalyzer.js';

const FIXTURES_DIR = resolve(import.meta.dirname, '..', 'fixtures');

describe('PackageAnalyzer', () => {
  let analyzer: PackageAnalyzer;

  beforeEach(() => {
    analyzer = new PackageAnalyzer();
  });

  describe('analyze', () => {
    it('should analyze a complete package.json', async () => {
      // Create a temp dir with our fixture
      const { mkdtemp, cp } = await import('node:fs/promises');
      const { tmpdir } = await import('node:os');
      const tmpDir = await mkdtemp(resolve(tmpdir(), 'rf-test-'));
      await cp(resolve(FIXTURES_DIR, 'complete-package.json'), resolve(tmpDir, 'package.json'));

      const result = await analyzer.analyze(tmpDir);

      expect(result.name).toBe('awesome-project');
      expect(result.version).toBe('2.1.0');
      expect(result.description).toBe(
        'An awesome full-stack application built with React and Express',
      );
      expect(result.license).toBe('MIT');
      expect(result.keywords).toEqual(['fullstack', 'react', 'express', 'typescript']);

      // Cleanup
      const { rm } = await import('node:fs/promises');
      await rm(tmpDir, { recursive: true });
    });

    it('should analyze a minimal package.json', async () => {
      const { mkdtemp, cp } = await import('node:fs/promises');
      const { tmpdir } = await import('node:os');
      const tmpDir = await mkdtemp(resolve(tmpdir(), 'rf-test-'));
      await cp(resolve(FIXTURES_DIR, 'minimal-package.json'), resolve(tmpDir, 'package.json'));

      const result = await analyzer.analyze(tmpDir);

      expect(result.name).toBe('minimal-lib');
      expect(result.version).toBe('0.1.0');
      expect(result.description).toBeUndefined();
      expect(result.license).toBeUndefined();
      expect(result.keywords).toEqual([]);
      expect(result.dependencies).toEqual({});

      const { rm } = await import('node:fs/promises');
      await rm(tmpDir, { recursive: true });
    });

    it('should throw error for missing package.json', async () => {
      const { mkdtemp } = await import('node:fs/promises');
      const { tmpdir } = await import('node:os');
      const tmpDir = await mkdtemp(resolve(tmpdir(), 'rf-test-'));

      await expect(analyzer.analyze(tmpDir)).rejects.toThrow('File not found');

      const { rm } = await import('node:fs/promises');
      await rm(tmpDir, { recursive: true });
    });

    it('should throw error for invalid JSON', async () => {
      const { mkdtemp, cp } = await import('node:fs/promises');
      const { tmpdir } = await import('node:os');
      const tmpDir = await mkdtemp(resolve(tmpdir(), 'rf-test-'));
      await cp(resolve(FIXTURES_DIR, 'invalid-package.json'), resolve(tmpDir, 'package.json'));

      await expect(analyzer.analyze(tmpDir)).rejects.toThrow('Invalid JSON');

      const { rm } = await import('node:fs/promises');
      await rm(tmpDir, { recursive: true });
    });
  });

  describe('normalizeAuthor', () => {
    it('should handle author as string with all parts', () => {
      const result = analyzer.normalizeAuthor('John Doe <john@example.com> (https://john.dev)');
      expect(result).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        url: 'https://john.dev',
      });
    });

    it('should handle author as string with name only', () => {
      const result = analyzer.normalizeAuthor('John Doe');
      expect(result).toEqual({
        name: 'John Doe',
        email: undefined,
        url: undefined,
      });
    });

    it('should handle author as object', () => {
      const result = analyzer.normalizeAuthor({
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(result).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        url: undefined,
      });
    });

    it('should return undefined for undefined author', () => {
      expect(analyzer.normalizeAuthor(undefined)).toBeUndefined();
    });
  });

  describe('normalizeRepository', () => {
    it('should normalize a repository object with git+https URL', () => {
      const result = analyzer.normalizeRepository({
        type: 'git',
        url: 'git+https://github.com/user/repo.git',
      });
      expect(result?.url).toBe('https://github.com/user/repo');
      expect(result?.owner).toBe('user');
      expect(result?.repo).toBe('repo');
    });

    it('should normalize a repository string', () => {
      const result = analyzer.normalizeRepository('https://github.com/user/repo');
      expect(result?.url).toBe('https://github.com/user/repo');
      expect(result?.owner).toBe('user');
      expect(result?.repo).toBe('repo');
    });

    it('should handle git:// URLs', () => {
      const result = analyzer.normalizeRepository('git://github.com/user/repo.git');
      expect(result?.url).toBe('https://github.com/user/repo');
    });

    it('should handle ssh URLs', () => {
      const result = analyzer.normalizeRepository('git@github.com:user/repo.git');
      expect(result?.url).toBe('https://github.com/user/repo');
    });

    it('should return undefined for undefined repository', () => {
      expect(analyzer.normalizeRepository(undefined)).toBeUndefined();
    });
  });

  describe('normalizeBugs', () => {
    it('should normalize bugs as string', () => {
      const result = analyzer.normalizeBugs('https://github.com/user/repo/issues');
      expect(result).toEqual({ url: 'https://github.com/user/repo/issues' });
    });

    it('should normalize bugs as object', () => {
      const result = analyzer.normalizeBugs({
        url: 'https://github.com/user/repo/issues',
        email: 'bugs@example.com',
      });
      expect(result).toEqual({
        url: 'https://github.com/user/repo/issues',
        email: 'bugs@example.com',
      });
    });

    it('should return undefined for undefined bugs', () => {
      expect(analyzer.normalizeBugs(undefined)).toBeUndefined();
    });
  });

  describe('categorizeScripts', () => {
    it('should categorize common scripts correctly', () => {
      const scripts = {
        dev: 'vite',
        build: 'tsc',
        test: 'vitest',
        lint: 'eslint .',
        format: 'prettier --write .',
        start: 'node dist/index.js',
        'custom-task': 'echo hello',
      };

      const result = analyzer.categorizeScripts(scripts);

      expect(result.dev).toHaveLength(1);
      expect(result.dev[0]!.name).toBe('dev');
      expect(result.build).toHaveLength(1);
      expect(result.test).toHaveLength(1);
      expect(result.lint).toHaveLength(1);
      expect(result.format).toHaveLength(1);
      expect(result.start).toHaveLength(1);
      expect(result.other).toHaveLength(1);
    });

    it('should handle empty scripts', () => {
      const result = analyzer.categorizeScripts({});
      expect(result.dev).toHaveLength(0);
      expect(result.build).toHaveLength(0);
      expect(result.test).toHaveLength(0);
    });

    it('should categorize test:coverage under test', () => {
      const scripts = { 'test:coverage': 'vitest --coverage' };
      const result = analyzer.categorizeScripts(scripts);
      expect(result.test).toHaveLength(1);
    });
  });
});
