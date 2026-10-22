[![npm version](https://img.shields.io/npm/v/forge-readme)](https://www.npmjs.com/package/forge-readme)
[![license](https://img.shields.io/npm/l/forge-readme)](https://www.npmjs.com/package/forge-readme)
[![node version](https://img.shields.io/node/v/forge-readme)](https://nodejs.org)
[![npm downloads](https://img.shields.io/npm/dm/forge-readme)](https://www.npmjs.com/package/forge-readme)
[![build status](https://img.shields.io/github/actions/workflow/status/RamThokane/npm-readme-forge/ci.yml?branch=main)](https://github.com/RamThokane/npm-readme-forge/actions)

# ✨ README Forge

> Auto-generate professional README.md files by analyzing your project. Zero config. One command.

Stop writing READMEs manually. **README Forge** analyzes your `package.json`, dependencies, scripts, and repository — then generates a polished, comprehensive README in seconds.

## 📋 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [CLI Usage](#-cli-usage)
- [Templates](#-templates)
- [Programmatic API](#-programmatic-api)
- [What Gets Analyzed](#-what-gets-analyzed)
- [Configuration](#-configuration)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features

- **📦 Package Analysis** — Extracts name, version, description, author, license, and more from `package.json`
- **📜 Script Detection** — Categorizes npm scripts into dev, build, test, lint, and format groups
- **🔍 Dependency Analysis** — Maps dependencies to display names and categories (frameworks, UI, testing, etc.)
- **🏷️ Badge Generation** — Auto-generates shields.io badges for npm version, license, downloads, build status
- **📋 Template Engine** — Choose between `default` (minimal) and `professional` (full-featured) templates
- **🔧 Package Manager Detection** — Detects npm, pnpm, yarn, or bun from lock files
- **🔗 Repository Detection** — Normalizes git URLs and extracts GitHub owner/repo
- **🛡️ Security** — Path traversal prevention, Zod input validation, safe file operations
- **📖 Fully Typed** — Complete TypeScript types and programmatic API

## 📦 Installation

### Global Installation

```bash
npm install -g forge-readme
```

### One-time Usage (no install)

```bash
npx forge-readme
```

### Project Dependency

```bash
# npm
npm install -D forge-readme

# pnpm
pnpm add -D forge-readme

# yarn
yarn add -D forge-readme
```

**Requirements:**
- **Node.js** >= 20.0.0

## ⚡ Quick Start

Navigate to any Node.js project directory and run:

```bash
npx forge-readme
```

That's it! A professional `README.md` will be generated based on your project.

## 🖥️ CLI Usage

```bash
forge-readme [generate] [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-t, --template <name>` | Template to use (`default`, `professional`) | `professional` |
| `-o, --output <path>` | Output file path | `README.md` |
| `--no-badges` | Exclude badges | – |
| `--no-scripts` | Exclude scripts section | – |
| `--no-deps` | Exclude dependencies section | – |
| `--verbose` | Enable verbose debug output | `false` |
| `-v, --version` | Display version | – |
| `-h, --help` | Display help | – |

### Examples

```bash
# Generate with defaults (professional template)
forge-readme

# Use minimal template
forge-readme --template default

# Custom output path
forge-readme --output docs/README.md

# Skip badges and dependencies
forge-readme --no-badges --no-deps

# Verbose mode for debugging
forge-readme --verbose
```

## 🎨 Templates

### Default

A clean, minimal template with:
- Title & description
- Installation command
- Scripts
- License

### Professional

A comprehensive template with:
- Shields.io badges
- Title, description & version
- Auto-generated table of contents
- Overview with keywords
- Installation with engine requirements
- Quick start guide
- Categorized scripts
- Tech stack overview
- Full dependency tables
- Repository & links
- Author info
- License
- Branded footer

## 💻 Programmatic API

README Forge can be used as a library in your own tools:

```typescript
import { ReadmeGenerator } from 'forge-readme';

const generator = new ReadmeGenerator({
  template: 'professional',
  output: 'README.md',
  includeBadges: true,
  includeScripts: true,
  includeDependencies: true,
  verbose: false,
});

const result = await generator.generate(process.cwd());
console.log(result.markdown);
```

### Individual Components

```typescript
import {
  PackageAnalyzer,
  DependencyAnalyzer,
  BadgeGenerator,
  ScriptGenerator,
} from 'forge-readme';

// Analyze package.json
const packageAnalyzer = new PackageAnalyzer();
const packageInfo = await packageAnalyzer.analyze('/path/to/project');

// Analyze dependencies
const depAnalyzer = new DependencyAnalyzer();
const deps = depAnalyzer.analyze(packageInfo);

// Generate badges
const badgeGen = new BadgeGenerator();
const badges = badgeGen.generate(packageInfo);
```

## 🔍 What Gets Analyzed

| Source | Data Extracted |
|--------|---------------|
| `package.json` | Name, version, description, author, license, keywords, engines |
| `package.json` scripts | Categorized into dev, build, test, lint, format, start |
| `package.json` dependencies | Production, dev, and peer deps with display names |
| `package.json` repository | Normalized GitHub URL, owner, repo |
| Lock files | Package manager detection (npm, pnpm, yarn, bun) |

## ⚙️ Configuration

### CLI Flags

All configuration is done via CLI flags (see [CLI Usage](#-cli-usage)).

### Future: Configuration File

`.readmeforgerc` support is planned for v1.1:

```json
{
  "template": "professional",
  "includeBadges": true,
  "includeScripts": true,
  "includeDependencies": true
}
```

## 🏗️ Architecture

```
src/
├── cli/             # CLI entry point & commands
│   ├── index.ts     # Commander.js setup
│   ├── commands.ts  # Generate command logic
│   └── prompts.ts   # Future: interactive prompts
├── analyzers/       # Project analysis
│   ├── packageAnalyzer.ts
│   └── dependencyAnalyzer.ts
├── generators/      # Markdown generation
│   ├── readmeGenerator.ts   # Main orchestrator
│   ├── badgeGenerator.ts
│   ├── scriptGenerator.ts
│   └── dependencyGenerator.ts
├── templates/       # README templates
│   ├── default.ts
│   └── professional.ts
├── types/           # TypeScript types & Zod schemas
│   └── index.ts
├── utils/           # Shared utilities
│   ├── fs.ts        # File system & package manager detection
│   ├── markdown.ts  # Markdown generation helpers
│   ├── logger.ts    # Colored CLI logging
│   └── constants.ts # Mappings & configuration
└── index.ts         # Public API exports
```

## 🗺️ Roadmap

- [x] **v1.0** — Core: package analysis, scripts, deps, badges, templates, CLI
- [ ] **v1.1** — Framework detection, project structure generation, `.readmeforgerc`
- [ ] **v1.2** — AI-powered README generation (OpenAI, Gemini, Anthropic)
- [ ] **v1.3** — Watch mode, source code feature detection
- [ ] **v2.0** — Open source & enterprise templates, interactive mode

## 🤝 Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

```bash
git clone https://github.com/RamThokane/npm-readme-forge.git
cd npm-readme-forge
pnpm install
pnpm test
```

## 👤 Author

**Ram Thokane**

- GitHub: [@RamThokane](https://github.com/RamThokane)
- Email: [thokaneram@gmail.com](mailto:thokaneram@gmail.com)
- npm: [~ramnt](https://www.npmjs.com/~ramnt)

## 📄 License

This project is licensed under the **MIT** license. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/RamThokane">Ram Thokane</a>
</p>
