import type {
  PackageInfo,
  DependencyAnalysis,
  DependencyInfo,
  DependencyCategory,
} from '../types/index.js';
import { DEPENDENCY_DISPLAY_NAMES, DEPENDENCY_CATEGORIES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

// ─── DependencyAnalyzer ──────────────────────────────────────────────────────

export class DependencyAnalyzer {
  /**
   * Analyze dependencies from the parsed package info.
   */
  analyze(packageInfo: PackageInfo): DependencyAnalysis {
    logger.debug('Analyzing dependencies...');

    const production = this.mapDependencies(packageInfo.dependencies);
    const development = this.mapDependencies(packageInfo.devDependencies);
    const peer = this.mapDependencies(packageInfo.peerDependencies);

    const totalCount = production.length + development.length + peer.length;

    logger.debug(
      `Found ${production.length} production, ${development.length} dev, ${peer.length} peer dependencies`,
    );

    return {
      production,
      development,
      peer,
      totalCount,
    };
  }

  /**
   * Map raw dependency entries to structured DependencyInfo objects.
   */
  private mapDependencies(deps: Record<string, string>): DependencyInfo[] {
    return Object.entries(deps).map(([packageName, version]) => ({
      packageName,
      displayName: this.getDisplayName(packageName),
      version,
      category: this.getCategory(packageName),
    }));
  }

  /**
   * Get the human-friendly display name for a package.
   */
  getDisplayName(packageName: string): string {
    // Check the known names map
    const known = DEPENDENCY_DISPLAY_NAMES[packageName];
    if (known) return known;

    // Auto-generate: strip scope, title-case
    const name = packageName.replace(/^@[\w-]+\//, '');
    return name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get the category for a package.
   */
  getCategory(packageName: string): DependencyCategory {
    // Check the known categories map
    const known = DEPENDENCY_CATEGORIES[packageName];
    if (known) return known;

    // Heuristic: check for common patterns
    if (packageName.startsWith('@types/')) return 'build';
    if (packageName.includes('eslint') || packageName.includes('prettier')) return 'build';
    if (packageName.includes('test') || packageName.includes('spec')) return 'testing';
    if (packageName.includes('plugin') || packageName.includes('loader')) return 'build';

    return 'other';
  }
}
