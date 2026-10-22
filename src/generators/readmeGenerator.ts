import type { ReadmeConfig, ReadmeResult, AnalysisData, Template } from '../types/index.js';
import { PackageAnalyzer } from '../analyzers/packageAnalyzer.js';
import { DependencyAnalyzer } from '../analyzers/dependencyAnalyzer.js';
import { BadgeGenerator } from './badgeGenerator.js';
import { defaultTemplate } from '../templates/default.js';
import { professionalTemplate } from '../templates/professional.js';
import { logger } from '../utils/logger.js';

// ─── Template Registry ──────────────────────────────────────────────────────

const TEMPLATES: Record<string, Template> = {
  default: defaultTemplate,
  professional: professionalTemplate,
};

// ─── ReadmeGenerator ─────────────────────────────────────────────────────────

export class ReadmeGenerator {
  private readonly config: ReadmeConfig;
  private readonly packageAnalyzer: PackageAnalyzer;
  private readonly dependencyAnalyzer: DependencyAnalyzer;
  private readonly badgeGenerator: BadgeGenerator;

  constructor(config: ReadmeConfig) {
    this.config = config;
    this.packageAnalyzer = new PackageAnalyzer();
    this.dependencyAnalyzer = new DependencyAnalyzer();
    this.badgeGenerator = new BadgeGenerator();
  }

  /**
   * Generate a README by analyzing the project at the given path.
   */
  async generate(cwd: string): Promise<ReadmeResult> {
    logger.debug(`Generating README for project at: ${cwd}`);

    // Step 1: Analyze package.json
    logger.debug('Step 1: Analyzing package.json...');
    const packageInfo = await this.packageAnalyzer.analyze(cwd);

    // Step 2: Analyze dependencies
    logger.debug('Step 2: Analyzing dependencies...');
    const dependencies = this.dependencyAnalyzer.analyze(packageInfo);

    // Step 3: Generate badges
    logger.debug('Step 3: Generating badges...');
    const badges = this.config.includeBadges ? this.badgeGenerator.generate(packageInfo) : [];

    // Step 4: Assemble analysis data
    const analysisData: AnalysisData = {
      packageInfo,
      dependencies,
      badges,
    };

    // Step 5: Select template and render
    logger.debug(`Step 4: Rendering with "${this.config.template}" template...`);
    const template = this.getTemplate(this.config.template);
    const markdown = template.render(analysisData);

    // Step 6: Build result
    const sections = template.sections.map((s) => ({
      id: s.id,
      title: s.title,
      content: '', // sections are embedded in the markdown
      order: s.order,
    }));

    const result: ReadmeResult = {
      markdown,
      sections,
      metadata: {
        generatedAt: new Date().toISOString(),
        template: this.config.template,
        outputPath: this.config.output,
      },
    };

    logger.debug('README generation complete');
    return result;
  }

  /**
   * Get a template by name.
   */
  private getTemplate(name: string): Template {
    const template = TEMPLATES[name];
    if (!template) {
      logger.warn(`Template "${name}" not found, falling back to "professional"`);
      return TEMPLATES['professional']!;
    }
    return template;
  }
}
