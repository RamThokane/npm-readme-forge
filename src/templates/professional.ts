import type { Template, AnalysisData } from '../types/index.js';
import { ScriptGenerator } from '../generators/scriptGenerator.js';
import { DependencyGenerator } from '../generators/dependencyGenerator.js';
import { BadgeGenerator } from '../generators/badgeGenerator.js';
import {
  heading,
  codeBlock,
  joinSections,
  link,
  tableOfContents,
  hr,
  list,
} from '../utils/markdown.js';
import { getInstallCommand, getRunCommand } from '../utils/fs.js';

// ─── Generators ──────────────────────────────────────────────────────────────

const scriptGenerator = new ScriptGenerator();
const dependencyGenerator = new DependencyGenerator();
const badgeGenerator = new BadgeGenerator();

// ─── Section Definitions ─────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'badges', title: 'Badges', order: 0, required: false },
  { id: 'title', title: 'Title', order: 1, required: true },
  { id: 'toc', title: 'Table of Contents', order: 2, required: false },
  { id: 'overview', title: 'Overview', order: 3, required: false },
  { id: 'installation', title: 'Installation', order: 4, required: true },
  { id: 'usage', title: 'Quick Start', order: 5, required: false },
  { id: 'scripts', title: 'Scripts', order: 6, required: false },
  { id: 'tech-stack', title: 'Tech Stack', order: 7, required: false },
  { id: 'dependencies', title: 'Dependencies', order: 8, required: false },
  { id: 'repository', title: 'Repository & Links', order: 9, required: false },
  { id: 'author', title: 'Author', order: 10, required: false },
  { id: 'license', title: 'License', order: 11, required: false },
  { id: 'footer', title: 'Footer', order: 12, required: false },
];

// ─── Professional Template ───────────────────────────────────────────────────

export const professionalTemplate: Template = {
  name: 'professional',
  description:
    'A comprehensive, professional README template with badges, TOC, and full documentation.',

  sections: SECTIONS,

  render(data: AnalysisData): string {
    const { packageInfo, dependencies, badges } = data;
    const sections: string[] = [];

    // ── Badges ──────────────────────────────────────────────────────────
    if (badges.length > 0) {
      sections.push(badgeGenerator.renderBadges(badges));
    }

    // ── Title & Description ─────────────────────────────────────────────
    const titleBlock: string[] = [heading(1, packageInfo.displayName)];
    if (packageInfo.description) {
      titleBlock.push(`> ${packageInfo.description}`);
    }
    if (packageInfo.version) {
      titleBlock.push(`**Version:** \`${packageInfo.version}\``);
    }
    sections.push(joinSections(titleBlock));

    // ── Table of Contents ───────────────────────────────────────────────
    const tocItems: { title: string; id: string }[] = [];
    tocItems.push({ title: 'Overview', id: 'overview' });
    tocItems.push({ title: 'Installation', id: 'installation' });
    tocItems.push({ title: 'Quick Start', id: 'quick-start' });

    const hasScripts = Object.values(packageInfo.scripts).some((cat) => cat.length > 0);
    if (hasScripts) {
      tocItems.push({ title: 'Scripts', id: 'scripts' });
    }
    if (dependencies.production.length > 0) {
      tocItems.push({ title: 'Tech Stack', id: 'tech-stack' });
      tocItems.push({ title: 'Dependencies', id: 'dependencies' });
    }
    if (packageInfo.repository || packageInfo.homepage) {
      tocItems.push({ title: 'Links', id: 'links' });
    }
    if (packageInfo.author) {
      tocItems.push({ title: 'Author', id: 'author' });
    }
    if (packageInfo.license) {
      tocItems.push({ title: 'License', id: 'license' });
    }

    sections.push(joinSections([heading(2, '📋 Table of Contents'), tableOfContents(tocItems)]));

    // ── Overview ────────────────────────────────────────────────────────
    const overviewLines: string[] = [heading(2, '✨ Overview')];
    if (packageInfo.description) {
      overviewLines.push(packageInfo.description);
    }
    if (packageInfo.keywords.length > 0) {
      overviewLines.push('');
      overviewLines.push(`**Keywords:** ${packageInfo.keywords.map((k) => `\`${k}\``).join(', ')}`);
    }
    sections.push(joinSections(overviewLines));

    // ── Installation ────────────────────────────────────────────────────
    const installCmd = getInstallCommand(packageInfo.packageManager);
    const installLines: string[] = [heading(2, '🚀 Installation'), codeBlock(installCmd, 'bash')];

    // Show engine requirements if specified
    if (Object.keys(packageInfo.engines).length > 0) {
      const engineReqs = Object.entries(packageInfo.engines)
        .map(([engine, version]) => `- **${engine}**: \`${version}\``)
        .join('\n');
      installLines.push('**Requirements:**');
      installLines.push(engineReqs);
    }

    sections.push(joinSections(installLines));

    // ── Quick Start ─────────────────────────────────────────────────────
    const quickStartLines: string[] = [heading(2, '⚡ Quick Start')];

    // Find a dev or start script
    const startScript = packageInfo.scripts.start[0] ?? packageInfo.scripts.dev[0];

    if (startScript) {
      const runCmd = getRunCommand(packageInfo.packageManager);
      quickStartLines.push(codeBlock(`${installCmd}\n${runCmd} ${startScript.name}`, 'bash'));
    } else {
      quickStartLines.push(codeBlock(installCmd, 'bash'));
    }

    sections.push(joinSections(quickStartLines));

    // ── Scripts ─────────────────────────────────────────────────────────
    if (hasScripts) {
      const scriptsContent = scriptGenerator.generate(
        packageInfo.scripts,
        packageInfo.packageManager,
      );
      if (scriptsContent) {
        sections.push(scriptsContent);
      }
    }

    // ── Tech Stack & Dependencies ───────────────────────────────────────
    if (dependencies.production.length > 0 || dependencies.development.length > 0) {
      const depContent = dependencyGenerator.generate(dependencies);
      if (depContent) {
        sections.push(depContent);
      }
    }

    // ── Repository & Links ──────────────────────────────────────────────
    const linkLines: string[] = [];
    if (packageInfo.repository || packageInfo.homepage || packageInfo.bugs) {
      linkLines.push(heading(2, '🔗 Links'));
      const linkItems: string[] = [];

      if (packageInfo.repository) {
        linkItems.push(`**Repository:** ${link('GitHub', packageInfo.repository.url)}`);
      }
      if (packageInfo.homepage) {
        linkItems.push(`**Homepage:** ${link(packageInfo.homepage, packageInfo.homepage)}`);
      }
      if (packageInfo.bugs) {
        linkItems.push(`**Issues:** ${link('Report a Bug', packageInfo.bugs.url)}`);
      }

      linkLines.push(list(linkItems));
      sections.push(joinSections(linkLines));
    }

    // ── Author ──────────────────────────────────────────────────────────
    if (packageInfo.author) {
      const authorLines: string[] = [heading(2, '👤 Author')];
      authorLines.push(`**${packageInfo.author.name}**`);

      if (packageInfo.author.email) {
        authorLines.push(
          `- Email: ${link(packageInfo.author.email, `mailto:${packageInfo.author.email}`)}`,
        );
      }
      if (packageInfo.author.url) {
        authorLines.push(`- Website: ${link(packageInfo.author.url, packageInfo.author.url)}`);
      }

      sections.push(joinSections(authorLines));
    }

    // ── License ─────────────────────────────────────────────────────────
    if (packageInfo.license) {
      sections.push(
        joinSections([
          heading(2, '📄 License'),
          `This project is licensed under the **${packageInfo.license}** license.`,
        ]),
      );
    }

    // ── Footer ──────────────────────────────────────────────────────────
    sections.push(
      joinSections([
        hr(),
        `<p align="center">Generated with ❤️ by <a href="https://github.com/RamThokane/npm-readme-forge">forge-readme</a></p>`,
      ]),
    );

    return joinSections(sections) + '\n';
  },
};
