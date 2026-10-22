import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { ReadmeGenerator } from '../../src/generators/readmeGenerator.js';
import type { ReadmeConfig } from '../../src/types/index.js';

const FIXTURES_DIR = resolve(import.meta.dirname, '..', 'fixtures');

async function createTempProject(
  fixture: string,
): Promise<{ dir: string; cleanup: () => Promise<void> }> {
  const { mkdtemp, cp } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const tmpDir = await mkdtemp(resolve(tmpdir(), 'rf-test-'));
  await cp(resolve(FIXTURES_DIR, fixture), resolve(tmpDir, 'package.json'));

  return {
    dir: tmpDir,
    cleanup: async () => {
      const { rm } = await import('node:fs/promises');
      await rm(tmpDir, { recursive: true });
    },
  };
}

describe('ReadmeGenerator', () => {
  describe('generate with professional template', () => {
    it('should generate a complete professional README', async () => {
      const { dir, cleanup } = await createTempProject('complete-package.json');

      try {
        const config: ReadmeConfig = {
          template: 'professional',
          output: 'README.md',
          includeBadges: true,
          includeScripts: true,
          includeDependencies: true,
          verbose: false,
        };

        const generator = new ReadmeGenerator(config);
        const result = await generator.generate(dir);

        // Verify structure
        expect(result.markdown).toBeTruthy();
        expect(result.metadata.template).toBe('professional');
        expect(result.metadata.generatedAt).toBeTruthy();

        // Verify content sections
        const md = result.markdown;
        expect(md).toContain('# Awesome Project');
        expect(md).toContain('Table of Contents');
        expect(md).toContain('Installation');
        expect(md).toContain('npm install');
        expect(md).toContain('Scripts');
        expect(md).toContain('MIT');
        expect(md).toContain('forge-readme');

        // Verify badges
        expect(md).toContain('img.shields.io');

        // Verify dependencies
        expect(md).toContain('React');
        expect(md).toContain('Express');

        // Verify author
        expect(md).toContain('Ram Thokane');

        // Verify links
        expect(md).toContain('github.com/ramthokane/awesome-project');
      } finally {
        await cleanup();
      }
    });

    it('should generate README without badges when disabled', async () => {
      const { dir, cleanup } = await createTempProject('complete-package.json');

      try {
        const config: ReadmeConfig = {
          template: 'professional',
          output: 'README.md',
          includeBadges: false,
          includeScripts: true,
          includeDependencies: true,
          verbose: false,
        };

        const generator = new ReadmeGenerator(config);
        const result = await generator.generate(dir);

        // Should not have badge images (but might still have shields references in deps)
        expect(result.markdown).not.toContain('![npm version]');
      } finally {
        await cleanup();
      }
    });
  });

  describe('generate with default template', () => {
    it('should generate a minimal default README', async () => {
      const { dir, cleanup } = await createTempProject('minimal-package.json');

      try {
        const config: ReadmeConfig = {
          template: 'default',
          output: 'README.md',
          includeBadges: true,
          includeScripts: true,
          includeDependencies: true,
          verbose: false,
        };

        const generator = new ReadmeGenerator(config);
        const result = await generator.generate(dir);

        expect(result.markdown).toContain('# Minimal Lib');
        expect(result.metadata.template).toBe('default');
      } finally {
        await cleanup();
      }
    });
  });

  describe('error handling', () => {
    it('should throw for missing package.json', async () => {
      const { mkdtemp } = await import('node:fs/promises');
      const { tmpdir } = await import('node:os');
      const tmpDir = await mkdtemp(resolve(tmpdir(), 'rf-test-'));

      const config: ReadmeConfig = {
        template: 'professional',
        output: 'README.md',
        includeBadges: true,
        includeScripts: true,
        includeDependencies: true,
        verbose: false,
      };

      const generator = new ReadmeGenerator(config);

      await expect(generator.generate(tmpDir)).rejects.toThrow('File not found');

      const { rm } = await import('node:fs/promises');
      await rm(tmpDir, { recursive: true });
    });
  });
});
