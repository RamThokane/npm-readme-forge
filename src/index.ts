// ─── README Forge — Public API ───────────────────────────────────────────────

// Generators
export { ReadmeGenerator } from './generators/readmeGenerator.js';
export { BadgeGenerator } from './generators/badgeGenerator.js';
export { ScriptGenerator } from './generators/scriptGenerator.js';
export { DependencyGenerator } from './generators/dependencyGenerator.js';

// Analyzers
export { PackageAnalyzer } from './analyzers/packageAnalyzer.js';
export { DependencyAnalyzer } from './analyzers/dependencyAnalyzer.js';

// Templates
export { defaultTemplate } from './templates/default.js';
export { professionalTemplate } from './templates/professional.js';

// Types
export type {
  PackageInfo,
  ReadmeConfig,
  ReadmeResult,
  AnalysisData,
  GeneratedSection,
  Badge,
  DependencyAnalysis,
  DependencyInfo,
  CategorizedScripts,
  ScriptEntry,
  Template,
  TemplateName,
  PackageManager,
  NormalizedAuthor,
  NormalizedRepository,
} from './types/index.js';

// Utilities
export { getInstallCommand, getRunCommand, detectPackageManager } from './utils/fs.js';
export * as markdown from './utils/markdown.js';
