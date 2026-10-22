import { describe, it, expect, beforeEach } from 'vitest';
import { ScriptGenerator } from '../../src/generators/scriptGenerator.js';
import type { CategorizedScripts } from '../../src/types/index.js';

function makeEmptyScripts(): CategorizedScripts {
  return { dev: [], build: [], test: [], lint: [], format: [], start: [], other: [] };
}

describe('ScriptGenerator', () => {
  let generator: ScriptGenerator;

  beforeEach(() => {
    generator = new ScriptGenerator();
  });

  it('should generate scripts section with categories', () => {
    const scripts: CategorizedScripts = {
      ...makeEmptyScripts(),
      dev: [{ name: 'dev', command: 'vite', category: 'dev' }],
      build: [{ name: 'build', command: 'tsc', category: 'build' }],
      test: [{ name: 'test', command: 'vitest', category: 'test' }],
    };

    const result = generator.generate(scripts, 'npm');

    expect(result).toContain('## 📜 Scripts');
    expect(result).toContain('### Development');
    expect(result).toContain('### Build');
    expect(result).toContain('### Testing');
    expect(result).toContain('npm run dev');
    expect(result).toContain('npm run build');
    expect(result).toContain('npm run test');
  });

  it('should use correct run command for pnpm', () => {
    const scripts: CategorizedScripts = {
      ...makeEmptyScripts(),
      dev: [{ name: 'dev', command: 'vite', category: 'dev' }],
    };

    const result = generator.generate(scripts, 'pnpm');

    expect(result).toContain('pnpm dev');
  });

  it('should use correct run command for yarn', () => {
    const scripts: CategorizedScripts = {
      ...makeEmptyScripts(),
      build: [{ name: 'build', command: 'tsc', category: 'build' }],
    };

    const result = generator.generate(scripts, 'yarn');

    expect(result).toContain('yarn build');
  });

  it('should return empty string for no scripts', () => {
    const result = generator.generate(makeEmptyScripts(), 'npm');
    expect(result).toBe('');
  });

  it('should handle start scripts correctly', () => {
    const scripts: CategorizedScripts = {
      ...makeEmptyScripts(),
      start: [{ name: 'start', command: 'node dist/index.js', category: 'start' }],
    };

    const result = generator.generate(scripts, 'npm');

    expect(result).toContain('npm start');
  });

  it('should skip empty categories', () => {
    const scripts: CategorizedScripts = {
      ...makeEmptyScripts(),
      build: [{ name: 'build', command: 'tsc', category: 'build' }],
    };

    const result = generator.generate(scripts, 'npm');

    expect(result).not.toContain('### Development');
    expect(result).toContain('### Build');
    expect(result).not.toContain('### Testing');
  });
});
