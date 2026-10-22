import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolve } from 'node:path';

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

describe('CLI commands', () => {
  beforeEach(() => {
    // Suppress console output during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('generateCommand', () => {
    it('should generate README with default options', async () => {
      const { dir, cleanup } = await createTempProject('complete-package.json');
      const originalCwd = process.cwd();

      try {
        // Mock process.cwd to point to temp dir
        vi.spyOn(process, 'cwd').mockReturnValue(dir);

        const { generateCommand } = await import('../../src/cli/commands.js');
        await generateCommand({
          template: 'professional',
          output: 'README.md',
          includeBadges: true,
          includeScripts: true,
          includeDependencies: true,
          verbose: false,
        });

        // Verify README was created
        const { readFile } = await import('node:fs/promises');
        const readme = await readFile(resolve(dir, 'README.md'), 'utf-8');

        expect(readme).toContain('# Awesome Project');
        expect(readme).toContain('MIT');
      } finally {
        vi.spyOn(process, 'cwd').mockReturnValue(originalCwd);
        await cleanup();
      }
    });

    it('should generate README with custom output path', async () => {
      const { dir, cleanup } = await createTempProject('complete-package.json');

      try {
        vi.spyOn(process, 'cwd').mockReturnValue(dir);

        const { generateCommand } = await import('../../src/cli/commands.js');
        await generateCommand({
          template: 'default',
          output: 'DOCS.md',
          includeBadges: false,
          includeScripts: true,
          includeDependencies: true,
          verbose: false,
        });

        const { readFile } = await import('node:fs/promises');
        const readme = await readFile(resolve(dir, 'DOCS.md'), 'utf-8');

        expect(readme).toContain('# Awesome Project');
      } finally {
        await cleanup();
      }
    });

    it('should handle missing package.json gracefully', async () => {
      const { mkdtemp } = await import('node:fs/promises');
      const { tmpdir } = await import('node:os');
      const tmpDir = await mkdtemp(resolve(tmpdir(), 'rf-test-'));

      try {
        vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);

        const { generateCommand } = await import('../../src/cli/commands.js');

        // Should not throw — handles error internally
        await generateCommand({
          template: 'professional',
          output: 'README.md',
          includeBadges: true,
          includeScripts: true,
          includeDependencies: true,
          verbose: false,
        });

        expect(process.exitCode).toBe(1);
      } finally {
        process.exitCode = undefined;
        const { rm } = await import('node:fs/promises');
        await rm(tmpDir, { recursive: true });
      }
    });

    it.each([
      ['invalid JSON', 'invalid-package.json', 'README.md', 'invalid JSON'],
      ['path traversal', 'complete-package.json', '../escape.md', 'Invalid output path'],
    ])('should report %s errors', async (_label, fixture, output, expected) => {
      const { dir, cleanup } = await createTempProject(fixture);
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        vi.spyOn(process, 'cwd').mockReturnValue(dir);

        const { generateCommand } = await import('../../src/cli/commands.js');
        await generateCommand({
          template: 'professional',
          output,
          includeBadges: true,
          includeScripts: true,
          includeDependencies: true,
          verbose: true,
        });

        expect(process.exitCode).toBe(1);
        expect(errorSpy.mock.calls.flat().join(' ')).toContain(expected);
      } finally {
        process.exitCode = undefined;
        await cleanup();
      }
    });

    it('should report invalid options', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        const { generateCommand } = await import('../../src/cli/commands.js');
        await generateCommand({ template: 'nope' as never });

        expect(process.exitCode).toBe(1);
        expect(errorSpy).toHaveBeenCalled();
      } finally {
        process.exitCode = undefined;
      }
    });
  });
});
