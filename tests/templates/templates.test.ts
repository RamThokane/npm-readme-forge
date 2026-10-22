import { describe, it, expect } from 'vitest';
import { defaultTemplate } from '../../src/templates/default.js';
import { professionalTemplate } from '../../src/templates/professional.js';
import type { AnalysisData } from '../../src/types/index.js';

function makeAnalysisData(overrides: Partial<AnalysisData> = {}): AnalysisData {
  return {
    packageInfo: {
      name: 'test-project',
      displayName: 'Test Project',
      version: '1.0.0',
      description: 'A test project for testing templates',
      author: { name: 'Test Author', email: 'test@example.com' },
      license: 'MIT',
      repository: {
        url: 'https://github.com/test/project',
        owner: 'test',
        repo: 'project',
      },
      homepage: 'https://test-project.dev',
      bugs: { url: 'https://github.com/test/project/issues' },
      keywords: ['test', 'example'],
      scripts: {
        dev: [{ name: 'dev', command: 'vite', category: 'dev' }],
        build: [{ name: 'build', command: 'tsc', category: 'build' }],
        test: [{ name: 'test', command: 'vitest', category: 'test' }],
        lint: [],
        format: [],
        start: [{ name: 'start', command: 'node dist/index.js', category: 'start' }],
        other: [],
      },
      dependencies: { react: '^19.0.0', express: '^5.0.0' },
      devDependencies: { typescript: '^5.8.0', vitest: '^4.0.0' },
      peerDependencies: {},
      engines: { node: '>=20.0.0' },
      packageManager: 'npm',
      private: false,
    },
    dependencies: {
      production: [
        { packageName: 'react', displayName: 'React', version: '^19.0.0', category: 'framework' },
        { packageName: 'express', displayName: 'Express', version: '^5.0.0', category: 'server' },
      ],
      development: [
        {
          packageName: 'typescript',
          displayName: 'TypeScript',
          version: '^5.8.0',
          category: 'build',
        },
        { packageName: 'vitest', displayName: 'Vitest', version: '^4.0.0', category: 'testing' },
      ],
      peer: [],
      totalCount: 4,
    },
    badges: [
      {
        label: 'npm version',
        url: 'https://img.shields.io/npm/v/test-project',
        link: 'https://npmjs.com/package/test-project',
        alt: 'npm version',
      },
      { label: 'license', url: 'https://img.shields.io/npm/l/test-project', alt: 'license' },
    ],
    ...overrides,
  };
}

describe('Templates', () => {
  describe('defaultTemplate', () => {
    it('should have correct metadata', () => {
      expect(defaultTemplate.name).toBe('default');
      expect(defaultTemplate.description).toBeTruthy();
      expect(defaultTemplate.sections.length).toBeGreaterThan(0);
    });

    it('should render a minimal README', () => {
      const data = makeAnalysisData();
      const result = defaultTemplate.render(data);

      expect(result).toContain('# Test Project');
      expect(result).toContain('A test project for testing templates');
      expect(result).toContain('Installation');
      expect(result).toContain('npm install');
      expect(result).toContain('MIT');
    });

    it('should include scripts section', () => {
      const data = makeAnalysisData();
      const result = defaultTemplate.render(data);

      expect(result).toContain('Scripts');
      expect(result).toContain('npm run dev');
    });

    it('should handle missing description', () => {
      const data = makeAnalysisData();
      data.packageInfo.description = undefined;
      const result = defaultTemplate.render(data);

      expect(result).toContain('# Test Project');
      // Should not crash
      expect(result).toBeTruthy();
    });
  });

  describe('professionalTemplate', () => {
    it('should have correct metadata', () => {
      expect(professionalTemplate.name).toBe('professional');
      expect(professionalTemplate.description).toBeTruthy();
      expect(professionalTemplate.sections.length).toBeGreaterThan(0);
    });

    it('should render a full professional README', () => {
      const data = makeAnalysisData();
      const result = professionalTemplate.render(data);

      // Badges
      expect(result).toContain('img.shields.io');

      // Title
      expect(result).toContain('# Test Project');

      // Version
      expect(result).toContain('1.0.0');

      // Table of Contents
      expect(result).toContain('Table of Contents');

      // Overview
      expect(result).toContain('Overview');
      expect(result).toContain('A test project for testing templates');

      // Keywords
      expect(result).toContain('test');
      expect(result).toContain('example');

      // Installation
      expect(result).toContain('Installation');
      expect(result).toContain('npm install');

      // Quick Start
      expect(result).toContain('Quick Start');

      // Scripts
      expect(result).toContain('Scripts');

      // Tech Stack
      expect(result).toContain('Tech Stack');
      expect(result).toContain('React');
      expect(result).toContain('Express');

      // Dependencies table
      expect(result).toContain('Dependencies');

      // Links
      expect(result).toContain('Links');
      expect(result).toContain('github.com/test/project');

      // Author
      expect(result).toContain('Test Author');

      // License
      expect(result).toContain('MIT');

      // Footer
      expect(result).toContain('forge-readme');
    });

    it('should include engine requirements', () => {
      const data = makeAnalysisData();
      const result = professionalTemplate.render(data);

      expect(result).toContain('node');
      expect(result).toContain('>=20.0.0');
    });

    it('should handle missing optional fields', () => {
      const data = makeAnalysisData();
      data.packageInfo.author = undefined;
      data.packageInfo.repository = undefined;
      data.packageInfo.homepage = undefined;
      data.packageInfo.bugs = undefined;
      data.badges = [];

      const result = professionalTemplate.render(data);

      // Should still render without crashing
      expect(result).toContain('# Test Project');
      expect(result).not.toContain('Author');
      expect(result).not.toContain('Links');
    });
  });

  describe('sparse data', () => {
    function makeSparseData(): AnalysisData {
      const data = makeAnalysisData({
        dependencies: { production: [], development: [], peer: [], totalCount: 0 },
        badges: [],
      });
      const info = data.packageInfo;
      info.description = undefined;
      info.version = undefined;
      info.license = undefined;
      info.author = { name: 'Solo' };
      info.repository = undefined;
      info.homepage = undefined;
      info.bugs = undefined;
      info.keywords = [];
      info.engines = {};
      info.packageManager = 'bun';
      for (const key of Object.keys(info.scripts) as (keyof typeof info.scripts)[]) {
        info.scripts[key] = [];
      }
      return data;
    }

    it.each([
      ['professional', professionalTemplate],
      ['default', defaultTemplate],
    ])('%s template should render with minimal fields', (_name, template) => {
      const result = template.render(makeSparseData());

      expect(result).toContain('# Test Project');
      expect(result).toContain('bun install');
      expect(result).not.toContain('This project is licensed');
      expect(result).not.toContain('Requirements');
    });

    it('should use the package manager run command in Quick Start', () => {
      const data = makeSparseData();
      data.packageInfo.scripts.dev = [{ name: 'dev', command: 'vite', category: 'dev' }];
      data.packageInfo.bugs = { url: 'https://example.com/issues' };

      const result = professionalTemplate.render(data);

      expect(result).toContain('bun run dev');
      expect(result).toContain('Report a Bug');
      expect(result).not.toContain('Email:');
    });
  });
});
