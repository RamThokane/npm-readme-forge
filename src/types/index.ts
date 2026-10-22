import { z } from 'zod';

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const AuthorObjectSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  url: z.string().optional(),
});

const RepositoryObjectSchema = z.object({
  type: z.string().optional(),
  url: z.string(),
  directory: z.string().optional(),
});

const BugsObjectSchema = z.object({
  url: z.string(),
  email: z.string().optional(),
});

export const PackageJsonSchema = z
  .object({
    name: z.string().default('unknown'),
    version: z.string().default('0.0.0'),
    description: z.string().optional(),
    author: z.union([z.string(), AuthorObjectSchema]).optional(),
    license: z.string().optional(),
    repository: z.union([z.string(), RepositoryObjectSchema]).optional(),
    homepage: z.string().optional(),
    bugs: z.union([z.string(), BugsObjectSchema]).optional(),
    keywords: z.array(z.string()).optional(),
    scripts: z.record(z.string(), z.string()).optional(),
    dependencies: z.record(z.string(), z.string()).optional(),
    devDependencies: z.record(z.string(), z.string()).optional(),
    peerDependencies: z.record(z.string(), z.string()).optional(),
    engines: z.record(z.string(), z.string()).optional(),
    private: z.boolean().optional(),
    type: z.string().optional(),
    main: z.string().optional(),
    bin: z.union([z.string(), z.record(z.string(), z.string())]).optional(),
  })
  .passthrough();

// ─── Inferred & Manual Types ─────────────────────────────────────────────────

export type PackageJson = z.infer<typeof PackageJsonSchema>;

export interface NormalizedAuthor {
  name: string;
  email?: string;
  url?: string;
}

export interface NormalizedRepository {
  url: string;
  type?: string;
  directory?: string;
  owner?: string;
  repo?: string;
}

export interface NormalizedBugs {
  url: string;
  email?: string;
}

export interface PackageInfo {
  name: string;
  displayName: string;
  version: string;
  description?: string;
  author?: NormalizedAuthor;
  license?: string;
  repository?: NormalizedRepository;
  homepage?: string;
  bugs?: NormalizedBugs;
  keywords: string[];
  scripts: CategorizedScripts;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  engines: Record<string, string>;
  packageManager: PackageManager;
  private: boolean;
}

// ─── Script Types ────────────────────────────────────────────────────────────

export type ScriptCategory = 'dev' | 'build' | 'test' | 'lint' | 'start' | 'format' | 'other';

export interface ScriptEntry {
  name: string;
  command: string;
  category: ScriptCategory;
}

export type CategorizedScripts = Record<ScriptCategory, ScriptEntry[]>;

// ─── Dependency Types ────────────────────────────────────────────────────────

export type DependencyCategory =
  | 'framework'
  | 'ui'
  | 'testing'
  | 'build'
  | 'utility'
  | 'database'
  | 'server'
  | 'other';

export interface DependencyInfo {
  packageName: string;
  displayName: string;
  version: string;
  category: DependencyCategory;
}

export interface DependencyAnalysis {
  production: DependencyInfo[];
  development: DependencyInfo[];
  peer: DependencyInfo[];
  totalCount: number;
}

// ─── Package Manager ─────────────────────────────────────────────────────────

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

// ─── Badge Types ─────────────────────────────────────────────────────────────

export interface Badge {
  label: string;
  url: string;
  link?: string;
  alt: string;
}

// ─── Template Types ──────────────────────────────────────────────────────────

export type TemplateName = 'default' | 'professional';

export interface TemplateSectionDef {
  id: string;
  title: string;
  order: number;
  required: boolean;
}

export interface Template {
  name: TemplateName;
  description: string;
  sections: TemplateSectionDef[];
  render(data: AnalysisData): string;
}

// ─── Analysis & Generation Types ─────────────────────────────────────────────

export interface AnalysisData {
  packageInfo: PackageInfo;
  dependencies: DependencyAnalysis;
  badges: Badge[];
}

export interface GeneratedSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface ReadmeResult {
  markdown: string;
  sections: GeneratedSection[];
  metadata: {
    generatedAt: string;
    template: TemplateName;
    outputPath: string;
  };
}

// ─── CLI Config ──────────────────────────────────────────────────────────────

export const ReadmeConfigSchema = z.object({
  template: z.enum(['default', 'professional']).default('professional'),
  output: z.string().default('README.md'),
  includeBadges: z.boolean().default(true),
  includeScripts: z.boolean().default(true),
  includeDependencies: z.boolean().default(true),
  verbose: z.boolean().default(false),
});

export type ReadmeConfig = z.infer<typeof ReadmeConfigSchema>;
