import { describe, it, expect, beforeEach } from 'vitest';
import { BadgeGenerator } from '../../src/generators/badgeGenerator.js';
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

describe('BadgeGenerator', () => {
  let generator: BadgeGenerator;

  beforeEach(() => {
    generator = new BadgeGenerator();
  });

  describe('generate', () => {
    it('should always generate npm version badge', () => {
      const badges = generator.generate(makePackageInfo());
      const versionBadge = badges.find((b) => b.label === 'npm version');

      expect(versionBadge).toBeDefined();
      expect(versionBadge!.url).toContain('img.shields.io/npm/v/test-project');
    });

    it('should generate license badge when license is present', () => {
      const badges = generator.generate(makePackageInfo({ license: 'MIT' }));
      const licenseBadge = badges.find((b) => b.label === 'license');

      expect(licenseBadge).toBeDefined();
      expect(licenseBadge!.url).toContain('img.shields.io/npm/l/test-project');
    });

    it('should not generate license badge when license is absent', () => {
      const badges = generator.generate(makePackageInfo());
      const licenseBadge = badges.find((b) => b.label === 'license');

      expect(licenseBadge).toBeUndefined();
    });

    it('should generate node version badge when engine is specified', () => {
      const badges = generator.generate(makePackageInfo({ engines: { node: '>=20.0.0' } }));
      const nodeBadge = badges.find((b) => b.label === 'node');

      expect(nodeBadge).toBeDefined();
      expect(nodeBadge!.url).toContain('img.shields.io/node/v/test-project');
    });

    it('should generate downloads badge', () => {
      const badges = generator.generate(makePackageInfo());
      const downloadsBadge = badges.find((b) => b.label === 'downloads');

      expect(downloadsBadge).toBeDefined();
      expect(downloadsBadge!.url).toContain('img.shields.io/npm/dm/test-project');
    });

    it('should generate build badge when GitHub repo is detected', () => {
      const badges = generator.generate(
        makePackageInfo({
          repository: {
            url: 'https://github.com/user/repo',
            owner: 'user',
            repo: 'repo',
          },
        }),
      );
      const buildBadge = badges.find((b) => b.label === 'build');

      expect(buildBadge).toBeDefined();
      expect(buildBadge!.url).toContain('github/actions/workflow/status/user/repo');
    });

    it('should not generate build badge without GitHub repo', () => {
      const badges = generator.generate(makePackageInfo());
      const buildBadge = badges.find((b) => b.label === 'build');

      expect(buildBadge).toBeUndefined();
    });

    it('should generate bundle size badge for non-private packages', () => {
      const badges = generator.generate(makePackageInfo({ private: false }));
      const bundleBadge = badges.find((b) => b.label === 'bundle size');

      expect(bundleBadge).toBeDefined();
      expect(bundleBadge!.url).toContain('bundlephobia/minzip/test-project');
    });

    it('should not generate bundle size badge for private packages', () => {
      const badges = generator.generate(makePackageInfo({ private: true }));
      const bundleBadge = badges.find((b) => b.label === 'bundle size');

      expect(bundleBadge).toBeUndefined();
    });
  });

  describe('renderBadges', () => {
    it('should render badges as markdown', () => {
      const badges = generator.generate(makePackageInfo({ license: 'MIT' }));
      const result = generator.renderBadges(badges);

      expect(result).toContain('![npm version]');
      expect(result).toContain('![license]');
      expect(result).toContain('img.shields.io');
    });
  });
});
