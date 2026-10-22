import type { Badge, PackageInfo } from '../types/index.js';
import { SHIELDS_BASE_URL, NPM_BASE_URL } from '../utils/constants.js';
import { badge as markdownBadge } from '../utils/markdown.js';
import { logger } from '../utils/logger.js';

// ─── BadgeGenerator ──────────────────────────────────────────────────────────

export class BadgeGenerator {
  /**
   * Generate all applicable badges for the package.
   */
  generate(packageInfo: PackageInfo): Badge[] {
    logger.debug('Generating badges...');

    const badges: Badge[] = [];
    const { name } = packageInfo;

    // npm version badge
    badges.push({
      label: 'npm version',
      url: `${SHIELDS_BASE_URL}/npm/v/${name}`,
      link: `${NPM_BASE_URL}/${name}`,
      alt: `npm version`,
    });

    // License badge
    if (packageInfo.license) {
      badges.push({
        label: 'license',
        url: `${SHIELDS_BASE_URL}/npm/l/${name}`,
        link: `${NPM_BASE_URL}/${name}`,
        alt: `license`,
      });
    }

    // Node.js version badge
    if (packageInfo.engines['node']) {
      badges.push({
        label: 'node',
        url: `${SHIELDS_BASE_URL}/node/v/${name}`,
        link: undefined,
        alt: `node version`,
      });
    }

    // Downloads badge
    badges.push({
      label: 'downloads',
      url: `${SHIELDS_BASE_URL}/npm/dm/${name}`,
      link: `${NPM_BASE_URL}/${name}`,
      alt: `npm downloads`,
    });

    // GitHub Actions build badge
    if (packageInfo.repository?.owner && packageInfo.repository?.repo) {
      const { owner, repo } = packageInfo.repository;
      badges.push({
        label: 'build',
        url: `${SHIELDS_BASE_URL}/github/actions/workflow/status/${owner}/${repo}/ci.yml?branch=main`,
        link: `https://github.com/${owner}/${repo}/actions`,
        alt: `build status`,
      });
    }

    // Bundle size badge (only for non-private packages)
    if (!packageInfo.private) {
      badges.push({
        label: 'bundle size',
        url: `${SHIELDS_BASE_URL}/bundlephobia/minzip/${name}`,
        link: `https://bundlephobia.com/package/${name}`,
        alt: `bundle size`,
      });
    }

    logger.debug(`Generated ${badges.length} badges`);
    return badges;
  }

  /**
   * Render badges as a markdown string.
   */
  renderBadges(badges: Badge[]): string {
    return badges.map((b) => markdownBadge(b.alt, b.url, b.link)).join('\n');
  }
}
