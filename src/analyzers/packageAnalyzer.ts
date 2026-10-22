import { resolve } from 'node:path';
import { PackageJsonSchema } from '../types/index.js';
import type {
  PackageInfo,
  PackageJson,
  NormalizedAuthor,
  NormalizedRepository,
  NormalizedBugs,
  CategorizedScripts,
  ScriptCategory,
  ScriptEntry,
} from '../types/index.js';
import { readJsonFile, detectPackageManager } from '../utils/fs.js';
import { titleCase } from '../utils/markdown.js';
import { logger } from '../utils/logger.js';
import { PACKAGE_JSON_FILE, SCRIPT_CATEGORY_PATTERNS } from '../utils/constants.js';

// ─── PackageAnalyzer ─────────────────────────────────────────────────────────

export class PackageAnalyzer {
  /**
   * Analyze the package.json in the given directory.
   */
  async analyze(cwd: string): Promise<PackageInfo> {
    const packageJsonPath = resolve(cwd, PACKAGE_JSON_FILE);
    logger.debug(`Reading ${packageJsonPath}`);

    // Read and validate
    const raw = await readJsonFile<unknown>(packageJsonPath);
    const parsed = PackageJsonSchema.parse(raw);

    logger.debug(`Parsed package.json for "${parsed.name}@${parsed.version}"`);

    // Detect package manager
    const packageManager = await detectPackageManager(cwd);

    return {
      name: parsed.name,
      displayName: titleCase(parsed.name.replace(/^@[\w-]+\//, '')),
      version: parsed.version,
      description: parsed.description,
      author: this.normalizeAuthor(parsed.author),
      license: parsed.license,
      repository: this.normalizeRepository(parsed.repository),
      homepage: parsed.homepage,
      bugs: this.normalizeBugs(parsed.bugs),
      keywords: parsed.keywords ?? [],
      scripts: this.categorizeScripts(parsed.scripts ?? {}),
      dependencies: parsed.dependencies ?? {},
      devDependencies: parsed.devDependencies ?? {},
      peerDependencies: parsed.peerDependencies ?? {},
      engines: parsed.engines ?? {},
      packageManager,
      private: parsed.private ?? false,
    };
  }

  // ─── Normalization Helpers ─────────────────────────────────────────────────

  /**
   * Normalize the author field into a consistent object format.
   */
  normalizeAuthor(author: PackageJson['author']): NormalizedAuthor | undefined {
    if (!author) return undefined;

    if (typeof author === 'string') {
      return this.parseAuthorString(author);
    }

    return {
      name: author.name,
      email: author.email,
      url: author.url,
    };
  }

  /**
   * Parse an author string like "Name <email> (url)"
   */
  private parseAuthorString(author: string): NormalizedAuthor {
    const nameMatch = author.match(/^([^<(]+)/);
    const emailMatch = author.match(/<([^>]+)>/);
    const urlMatch = author.match(/\(([^)]+)\)/);

    return {
      name: nameMatch?.[1]?.trim() ?? author.trim(),
      email: emailMatch?.[1]?.trim(),
      url: urlMatch?.[1]?.trim(),
    };
  }

  /**
   * Normalize the repository field into a consistent object format.
   * Converts git+https:// and git:// URLs to plain https://.
   */
  normalizeRepository(repository: PackageJson['repository']): NormalizedRepository | undefined {
    if (!repository) return undefined;

    let url: string;
    let type: string | undefined;
    let directory: string | undefined;

    if (typeof repository === 'string') {
      url = repository;
    } else {
      url = repository.url;
      type = repository.type;
      directory = repository.directory;
    }

    // Clean up the URL
    url = this.normalizeGitUrl(url);

    // Extract owner/repo from GitHub URL
    const ghMatch = url.match(/github\.com\/([^/]+)\/([^/.\s#]+)/);

    return {
      url,
      type,
      directory,
      owner: ghMatch?.[1],
      repo: ghMatch?.[2],
    };
  }

  /**
   * Convert git+https:// and git:// URLs to plain https:// URLs.
   * Also removes trailing .git suffix.
   */
  private normalizeGitUrl(url: string): string {
    let normalized = url;

    // git+https://... → https://...
    if (normalized.startsWith('git+https://')) {
      normalized = normalized.slice(4);
    }

    // git+ssh://git@github.com/... → https://github.com/...
    if (normalized.startsWith('git+ssh://git@')) {
      normalized = normalized.replace('git+ssh://git@', 'https://');
    }

    // git://github.com/... → https://github.com/...
    if (normalized.startsWith('git://')) {
      normalized = normalized.replace('git://', 'https://');
    }

    // ssh://git@github.com/... → https://github.com/...
    if (normalized.startsWith('ssh://git@')) {
      normalized = normalized.replace('ssh://git@', 'https://');
    }

    // git@github.com:owner/repo.git → https://github.com/owner/repo
    if (normalized.startsWith('git@')) {
      normalized = normalized.replace(/^git@([^:]+):/, 'https://$1/');
    }

    // Remove trailing .git
    if (normalized.endsWith('.git')) {
      normalized = normalized.slice(0, -4);
    }

    return normalized;
  }

  /**
   * Normalize the bugs field into a consistent object format.
   */
  normalizeBugs(bugs: PackageJson['bugs']): NormalizedBugs | undefined {
    if (!bugs) return undefined;

    if (typeof bugs === 'string') {
      return { url: bugs };
    }

    return {
      url: bugs.url,
      email: bugs.email,
    };
  }

  // ─── Script Categorization ────────────────────────────────────────────────

  /**
   * Categorize scripts into dev, build, test, lint, format, start, other.
   */
  categorizeScripts(scripts: Record<string, string>): CategorizedScripts {
    const categories: CategorizedScripts = {
      dev: [],
      build: [],
      test: [],
      lint: [],
      format: [],
      start: [],
      other: [],
    };

    for (const [name, command] of Object.entries(scripts)) {
      const category = this.detectScriptCategory(name);
      const entry: ScriptEntry = { name, command, category };
      categories[category].push(entry);
    }

    return categories;
  }

  /**
   * Detect the category of a script by its name.
   */
  private detectScriptCategory(scriptName: string): ScriptCategory {
    // Exact match first
    const exactMatch = SCRIPT_CATEGORY_PATTERNS[scriptName];
    if (exactMatch) return exactMatch;

    // Prefix/contains match
    const lowerName = scriptName.toLowerCase();
    for (const [pattern, category] of Object.entries(SCRIPT_CATEGORY_PATTERNS)) {
      if (lowerName.startsWith(pattern) || lowerName.includes(pattern)) {
        return category;
      }
    }

    return 'other';
  }
}
