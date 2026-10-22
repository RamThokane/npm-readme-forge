import type { CategorizedScripts, PackageManager, ScriptCategory } from '../types/index.js';
import { heading, codeBlock, joinSections } from '../utils/markdown.js';
import { getRunCommand } from '../utils/fs.js';
import { logger } from '../utils/logger.js';

// ─── Category Labels ─────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<ScriptCategory, string> = {
  dev: 'Development',
  start: 'Start',
  build: 'Build',
  test: 'Testing',
  lint: 'Linting',
  format: 'Formatting',
  other: 'Other',
};

const CATEGORY_ORDER: ScriptCategory[] = [
  'start',
  'dev',
  'build',
  'test',
  'lint',
  'format',
  'other',
];

// ─── ScriptGenerator ─────────────────────────────────────────────────────────

export class ScriptGenerator {
  /**
   * Generate the "Scripts" markdown section.
   */
  generate(scripts: CategorizedScripts, packageManager: PackageManager): string {
    logger.debug('Generating scripts section...');

    const runCmd = getRunCommand(packageManager);
    const sections: string[] = [];

    for (const category of CATEGORY_ORDER) {
      const entries = scripts[category];
      if (!entries || entries.length === 0) continue;

      const label = CATEGORY_LABELS[category];
      const lines: string[] = [heading(3, label)];

      for (const entry of entries) {
        const command =
          category === 'start' && entry.name === 'start'
            ? `${packageManager === 'npm' ? 'npm' : runCmd} start`
            : `${runCmd} ${entry.name}`;

        lines.push('');
        lines.push(codeBlock(command, 'bash'));
      }

      sections.push(lines.join('\n'));
    }

    if (sections.length === 0) {
      return '';
    }

    return joinSections([heading(2, '📜 Scripts'), ...sections]);
  }
}
