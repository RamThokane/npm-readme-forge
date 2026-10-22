import type { Template, AnalysisData } from '../types/index.js';
import { ScriptGenerator } from '../generators/scriptGenerator.js';
import { heading, codeBlock, joinSections } from '../utils/markdown.js';
import { getInstallCommand } from '../utils/fs.js';

// ─── Generators ──────────────────────────────────────────────────────────────

const scriptGenerator = new ScriptGenerator();

// ─── Default Template ────────────────────────────────────────────────────────

export const defaultTemplate: Template = {
  name: 'default',
  description: 'A clean, minimal README template for simple projects.',

  sections: [
    { id: 'title', title: 'Title', order: 1, required: true },
    { id: 'description', title: 'Description', order: 2, required: false },
    { id: 'installation', title: 'Installation', order: 3, required: true },
    { id: 'scripts', title: 'Scripts', order: 4, required: false },
    { id: 'license', title: 'License', order: 5, required: false },
  ],

  render(data: AnalysisData): string {
    const { packageInfo } = data;
    const sections: string[] = [];

    // Title
    sections.push(heading(1, packageInfo.displayName));

    // Description
    if (packageInfo.description) {
      sections.push(packageInfo.description);
    }

    // Installation
    const installCmd = getInstallCommand(packageInfo.packageManager);
    sections.push(joinSections([heading(2, 'Installation'), codeBlock(installCmd, 'bash')]));

    // Scripts
    const scriptsSection = scriptGenerator.generate(
      packageInfo.scripts,
      packageInfo.packageManager,
    );
    if (scriptsSection) {
      sections.push(scriptsSection);
    }

    // License
    if (packageInfo.license) {
      sections.push(
        joinSections([
          heading(2, 'License'),
          `This project is licensed under the ${packageInfo.license} license.`,
        ]),
      );
    }

    return joinSections(sections) + '\n';
  },
};
