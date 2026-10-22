# Contributing to README Forge

Thank you for your interest in contributing to README Forge! 🎉

## Getting Started

### Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/RamThokane/npm-readme-forge.git
cd npm-readme-forge

# Install dependencies
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test
```

## Development Workflow

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Watch mode for development |
| `pnpm build` | Build the project |
| `pnpm test` | Run all tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm lint` | Lint the source code |
| `pnpm lint:fix` | Fix lint issues |
| `pnpm format` | Format code with Prettier |
| `pnpm typecheck` | Run TypeScript type checking |

### Making Changes

1. **Fork** the repository
2. Create a **feature branch**: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Run linting: `pnpm lint`
6. **Commit** your changes: `git commit -m "feat: add your feature"`
7. **Push** to your fork: `git push origin feature/your-feature`
8. Open a **Pull Request**

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — A new feature
- `fix:` — A bug fix
- `docs:` — Documentation changes
- `test:` — Adding or updating tests
- `refactor:` — Code refactoring
- `chore:` — Maintenance tasks

### Code Style

- TypeScript strict mode
- ESLint for linting
- Prettier for formatting
- Run `pnpm lint && pnpm format` before committing

### Testing

- Write tests for all new features and bug fixes
- Maintain ≥ 90% code coverage
- Use Vitest for testing
- Place tests in `tests/` mirroring the `src/` structure

## Project Architecture

```
src/
├── cli/          # CLI entry point and commands
├── analyzers/    # Project analysis modules
├── generators/   # Markdown generation modules
├── templates/    # README templates
├── types/        # TypeScript type definitions
└── utils/        # Shared utilities
```

## Reporting Issues

- Use the [Bug Report](https://github.com/RamThokane/npm-readme-forge/issues/new?template=bug_report.yml) template for bugs
- Use the [Feature Request](https://github.com/RamThokane/npm-readme-forge/issues/new?template=feature_request.yml) template for ideas

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
