import { describe, it, expect, beforeEach } from 'vitest';
import { DependencyAnalyzer } from '../../src/analyzers/dependencyAnalyzer.js';
import type { PackageInfo } from '../../src/types/index.js';

function makePackageInfo(overrides: Partial<PackageInfo> = {}): PackageInfo {
  return {
    name: 'test-project',
    displayName: 'Test Project',
    version: '1.0.0',
    keywords: [],
    scripts: { dev: [], build: [], test: [], lint: [], format: [], start: [], other: [] },
    dependencies: {},
    devDependencies: {},
    peerDependencies: {},
    engines: {},
    packageManager: 'npm',
    private: false,
    ...overrides,
  };
}

describe('DependencyAnalyzer', () => {
  let analyzer: DependencyAnalyzer;

  beforeEach(() => {
    analyzer = new DependencyAnalyzer();
  });

  describe('analyze', () => {
    it('should analyze production dependencies', () => {
      const packageInfo = makePackageInfo({
        dependencies: {
          react: '^19.0.0',
          express: '^5.0.0',
          axios: '^1.7.0',
        },
      });

      const result = analyzer.analyze(packageInfo);

      expect(result.production).toHaveLength(3);
      expect(result.totalCount).toBe(3);
    });

    it('should analyze dev dependencies', () => {
      const packageInfo = makePackageInfo({
        devDependencies: {
          typescript: '^5.8.0',
          vitest: '^4.0.0',
          eslint: '^9.0.0',
        },
      });

      const result = analyzer.analyze(packageInfo);

      expect(result.development).toHaveLength(3);
      expect(result.totalCount).toBe(3);
    });

    it('should analyze peer dependencies', () => {
      const packageInfo = makePackageInfo({
        peerDependencies: {
          react: '>=18.0.0',
        },
      });

      const result = analyzer.analyze(packageInfo);

      expect(result.peer).toHaveLength(1);
    });

    it('should handle empty dependencies', () => {
      const packageInfo = makePackageInfo();
      const result = analyzer.analyze(packageInfo);

      expect(result.production).toHaveLength(0);
      expect(result.development).toHaveLength(0);
      expect(result.peer).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('should count all dependency types in totalCount', () => {
      const packageInfo = makePackageInfo({
        dependencies: { react: '^19' },
        devDependencies: { vitest: '^4' },
        peerDependencies: { react: '>=18' },
      });

      const result = analyzer.analyze(packageInfo);
      expect(result.totalCount).toBe(3);
    });
  });

  describe('getDisplayName', () => {
    it('should return known display names', () => {
      expect(analyzer.getDisplayName('react')).toBe('React');
      expect(analyzer.getDisplayName('next')).toBe('Next.js');
      expect(analyzer.getDisplayName('express')).toBe('Express');
      expect(analyzer.getDisplayName('typescript')).toBe('TypeScript');
      expect(analyzer.getDisplayName('@nestjs/core')).toBe('NestJS');
    });

    it('should auto-generate display names for unknown packages', () => {
      expect(analyzer.getDisplayName('my-awesome-lib')).toBe('My Awesome Lib');
    });

    it('should strip scope from unknown scoped packages', () => {
      expect(analyzer.getDisplayName('@scope/my-package')).toBe('My Package');
    });
  });

  describe('getCategory', () => {
    it('should return known categories', () => {
      expect(analyzer.getCategory('react')).toBe('framework');
      expect(analyzer.getCategory('express')).toBe('server');
      expect(analyzer.getCategory('vitest')).toBe('testing');
      expect(analyzer.getCategory('mongoose')).toBe('database');
      expect(analyzer.getCategory('vite')).toBe('build');
    });

    it('should use heuristics for unknown packages', () => {
      expect(analyzer.getCategory('@types/node')).toBe('build');
      expect(analyzer.getCategory('eslint-plugin-react')).toBe('build');
    });

    it('should return "other" for truly unknown packages', () => {
      expect(analyzer.getCategory('some-random-package')).toBe('other');
    });
  });
});
