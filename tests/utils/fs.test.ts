import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, readFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import {
  isWithinDirectory,
  validatePath,
  fileExists,
  readTextFile,
  readJsonFile,
  safeWriteFile,
  detectPackageManager,
  getInstallCommand,
  getRunCommand,
} from '../../src/utils/fs.js';

describe('fs utils', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(resolve(tmpdir(), 'rf-fs-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  describe('isWithinDirectory', () => {
    it('should accept the base itself and nested paths', () => {
      expect(isWithinDirectory(dir, dir)).toBe(true);
      expect(isWithinDirectory(resolve(dir, 'a', 'b.md'), dir)).toBe(true);
      expect(isWithinDirectory(resolve(dir, '..foo'), dir)).toBe(true);
    });

    it('should reject parent and sibling-prefix paths', () => {
      expect(isWithinDirectory(resolve(dir, '..'), dir)).toBe(false);
      expect(isWithinDirectory(`${dir}-evil`, dir)).toBe(false);
    });
  });

  describe('validatePath', () => {
    it('should resolve safe relative paths', () => {
      expect(validatePath('README.md', dir)).toBe(resolve(dir, 'README.md'));
    });

    it('should throw on traversal', () => {
      expect(() => validatePath('../outside.md', dir)).toThrow('Path traversal');
    });
  });

  describe('file reading', () => {
    it('should detect existing and missing files', async () => {
      await writeFile(resolve(dir, 'a.txt'), 'hi');
      expect(await fileExists(resolve(dir, 'a.txt'))).toBe(true);
      expect(await fileExists(resolve(dir, 'missing.txt'))).toBe(false);
    });

    it('should read text files', async () => {
      await writeFile(resolve(dir, 'a.txt'), 'hello');
      expect(await readTextFile(resolve(dir, 'a.txt'))).toBe('hello');
    });

    it('should throw a friendly error for missing files', async () => {
      await expect(readTextFile(resolve(dir, 'nope.txt'))).rejects.toThrow('File not found');
    });

    it('should wrap other read errors', async () => {
      await expect(readTextFile(dir)).rejects.toThrow('Failed to read file');
    });

    it('should parse JSON and reject invalid JSON', async () => {
      await writeFile(resolve(dir, 'ok.json'), '{"a":1}');
      await writeFile(resolve(dir, 'bad.json'), '{oops');
      expect(await readJsonFile<{ a: number }>(resolve(dir, 'ok.json'))).toEqual({ a: 1 });
      await expect(readJsonFile(resolve(dir, 'bad.json'))).rejects.toThrow('Invalid JSON');
    });
  });

  describe('safeWriteFile', () => {
    it('should write relative and absolute paths inside the base', async () => {
      await safeWriteFile('out.md', 'one', dir);
      await safeWriteFile(resolve(dir, 'abs.md'), 'two', dir);
      expect(await readFile(resolve(dir, 'out.md'), 'utf-8')).toBe('one');
      expect(await readFile(resolve(dir, 'abs.md'), 'utf-8')).toBe('two');
    });

    it('should refuse to write outside the base', async () => {
      await expect(safeWriteFile('../evil.md', 'x', dir)).rejects.toThrow('Path traversal');
      await expect(safeWriteFile(`${dir}-evil/x.md`, 'x', dir)).rejects.toThrow('Path traversal');
    });

    it('should wrap write errors', async () => {
      await mkdir(resolve(dir, 'sub'));
      await expect(safeWriteFile('sub', 'x', dir)).rejects.toThrow('Failed to write file');
    });
  });

  describe('package manager helpers', () => {
    it('should default to npm', async () => {
      expect(await detectPackageManager(dir)).toBe('npm');
    });

    it.each([
      ['pnpm-lock.yaml', 'pnpm'],
      ['yarn.lock', 'yarn'],
      ['bun.lockb', 'bun'],
      ['package-lock.json', 'npm'],
    ])('should detect %s as %s', async (lockFile, manager) => {
      await writeFile(resolve(dir, lockFile), '');
      expect(await detectPackageManager(dir)).toBe(manager);
    });

    it('should return install and run commands', () => {
      expect(getInstallCommand('pnpm')).toBe('pnpm install');
      expect(getInstallCommand('bun')).toBe('bun install');
      expect(getRunCommand('npm')).toBe('npm run');
      expect(getRunCommand('yarn')).toBe('yarn');
    });
  });
});
