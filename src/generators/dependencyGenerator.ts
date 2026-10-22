import type { DependencyAnalysis, DependencyInfo, DependencyCategory } from '../types/index.js';
import { heading, list, table, joinSections } from '../utils/markdown.js';
import { logger } from '../utils/logger.js';

// ─── Category Labels ─────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<DependencyCategory, string> = {
  framework: '🏗️',
  server: '🖥️',
  ui: '🎨',
  testing: '🧪',
  build: '⚙️',
  database: '🗄️',
  utility: '🔧',
  other: '📦',
};

// ─── DependencyGenerator ─────────────────────────────────────────────────────

export class DependencyGenerator {
  /**
   * Generate the "Tech Stack" or "Dependencies" markdown section.
   */
  generate(analysis: DependencyAnalysis): string {
    logger.debug('Generating dependencies section...');

    if (analysis.totalCount === 0) {
      return '';
    }

    const sections: string[] = [];

    // Tech stack (notable production deps)
    const techStack = this.generateTechStack(analysis.production);
    if (techStack) {
      sections.push(techStack);
    }

    // Full dependency table
    const depTable = this.generateDependencyTable(analysis);
    if (depTable) {
      sections.push(depTable);
    }

    return joinSections(sections);
  }

  /**
   * Generate a concise "Tech Stack" list from notable production dependencies.
   */
  private generateTechStack(production: DependencyInfo[]): string {
    const notable = production.filter((d) => d.category !== 'other' && d.category !== 'build');

    if (notable.length === 0) return '';

    const grouped = this.groupByCategory(notable);
    const lines: string[] = [heading(2, '🛠️ Tech Stack')];

    for (const [category, deps] of grouped) {
      const icon = CATEGORY_ICONS[category] ?? '📦';
      const label = this.categoryLabel(category);
      lines.push('');
      lines.push(`**${icon} ${label}**`);
      lines.push('');
      lines.push(list(deps.map((d) => `${d.displayName} \`${d.version}\``)));
    }

    return lines.join('\n');
  }

  /**
   * Generate a dependency table for the full breakdown.
   */
  private generateDependencyTable(analysis: DependencyAnalysis): string {
    const sections: string[] = [heading(2, '📦 Dependencies')];

    if (analysis.production.length > 0) {
      sections.push(heading(3, 'Production'));
      sections.push(
        table(
          ['Package', 'Version'],
          analysis.production.map((d) => [d.displayName, `\`${d.version}\``]),
        ),
      );
    }

    if (analysis.development.length > 0) {
      sections.push(heading(3, 'Development'));
      sections.push(
        table(
          ['Package', 'Version'],
          analysis.development.map((d) => [d.displayName, `\`${d.version}\``]),
        ),
      );
    }

    if (analysis.peer.length > 0) {
      sections.push(heading(3, 'Peer'));
      sections.push(
        table(
          ['Package', 'Version'],
          analysis.peer.map((d) => [d.displayName, `\`${d.version}\``]),
        ),
      );
    }

    return joinSections(sections);
  }

  /**
   * Group dependencies by category, preserving order.
   */
  private groupByCategory(deps: DependencyInfo[]): Map<DependencyCategory, DependencyInfo[]> {
    const grouped = new Map<DependencyCategory, DependencyInfo[]>();
    for (const dep of deps) {
      const existing = grouped.get(dep.category);
      if (existing) {
        existing.push(dep);
      } else {
        grouped.set(dep.category, [dep]);
      }
    }
    return grouped;
  }

  /**
   * Get a human-readable label for a dependency category.
   */
  private categoryLabel(category: DependencyCategory): string {
    const labels: Record<DependencyCategory, string> = {
      framework: 'Frameworks',
      server: 'Server',
      ui: 'UI Libraries',
      testing: 'Testing',
      build: 'Build Tools',
      database: 'Database',
      utility: 'Utilities',
      other: 'Other',
    };
    return labels[category];
  }
}
