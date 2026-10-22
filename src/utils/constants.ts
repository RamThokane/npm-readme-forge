import type { ScriptCategory, DependencyCategory, PackageManager } from '../types/index.js';

// ─── Package Metadata ────────────────────────────────────────────────────────

export const PACKAGE_NAME = 'forge-readme';
export const VERSION = '1.0.0';
export const DESCRIPTION = 'Auto-generate professional README.md files by analyzing your project';

// ─── Defaults ────────────────────────────────────────────────────────────────

export const DEFAULT_OUTPUT = 'README.md';
export const DEFAULT_TEMPLATE = 'professional' as const;
export const PACKAGE_JSON_FILE = 'package.json';

// ─── Script Category Patterns ────────────────────────────────────────────────

/** Maps script name patterns to their category */
export const SCRIPT_CATEGORY_PATTERNS: Record<string, ScriptCategory> = {
  // Dev
  dev: 'dev',
  develop: 'dev',
  serve: 'dev',
  start: 'start',
  // Build
  build: 'build',
  compile: 'build',
  bundle: 'build',
  prepublish: 'build',
  prepublishOnly: 'build',
  // Test
  test: 'test',
  'test:watch': 'test',
  'test:coverage': 'test',
  'test:e2e': 'test',
  'test:unit': 'test',
  spec: 'test',
  // Lint
  lint: 'lint',
  'lint:fix': 'lint',
  eslint: 'lint',
  typecheck: 'lint',
  'type-check': 'lint',
  // Format
  format: 'format',
  'format:check': 'format',
  prettier: 'format',
  fmt: 'format',
};

// ─── Dependency Display Names ────────────────────────────────────────────────

/** Maps npm package names to human-friendly display names */
export const DEPENDENCY_DISPLAY_NAMES: Record<string, string> = {
  // Frameworks
  react: 'React',
  'react-dom': 'React DOM',
  next: 'Next.js',
  vue: 'Vue.js',
  nuxt: 'Nuxt',
  angular: 'Angular',
  '@angular/core': 'Angular',
  svelte: 'Svelte',
  express: 'Express',
  fastify: 'Fastify',
  koa: 'Koa',
  hono: 'Hono',
  '@nestjs/core': 'NestJS',
  '@nestjs/common': 'NestJS Common',

  // State Management
  redux: 'Redux',
  '@reduxjs/toolkit': 'Redux Toolkit',
  zustand: 'Zustand',
  mobx: 'MobX',
  jotai: 'Jotai',

  // Styling
  tailwindcss: 'Tailwind CSS',
  'styled-components': 'Styled Components',
  '@emotion/react': 'Emotion',
  sass: 'Sass',

  // Build Tools
  vite: 'Vite',
  webpack: 'Webpack',
  rollup: 'Rollup',
  esbuild: 'esbuild',
  tsup: 'tsup',
  turbo: 'Turborepo',

  // Testing
  jest: 'Jest',
  vitest: 'Vitest',
  mocha: 'Mocha',
  cypress: 'Cypress',
  playwright: 'Playwright',
  '@playwright/test': 'Playwright',
  '@testing-library/react': 'React Testing Library',

  // Databases
  mongoose: 'Mongoose',
  prisma: 'Prisma',
  '@prisma/client': 'Prisma Client',
  typeorm: 'TypeORM',
  drizzle: 'Drizzle ORM',
  'drizzle-orm': 'Drizzle ORM',
  sequelize: 'Sequelize',
  pg: 'PostgreSQL (pg)',
  mysql2: 'MySQL',
  redis: 'Redis',
  ioredis: 'ioredis',

  // Auth
  jsonwebtoken: 'JSON Web Token',
  passport: 'Passport.js',
  'next-auth': 'NextAuth.js',

  // HTTP
  axios: 'Axios',
  'node-fetch': 'node-fetch',
  got: 'Got',
  ky: 'Ky',

  // Validation
  zod: 'Zod',
  joi: 'Joi',
  yup: 'Yup',

  // CLI
  commander: 'Commander.js',
  yargs: 'Yargs',
  chalk: 'Chalk',
  ora: 'Ora',
  inquirer: 'Inquirer',
  boxen: 'Boxen',

  // Utilities
  lodash: 'Lodash',
  'date-fns': 'date-fns',
  dayjs: 'Day.js',
  uuid: 'UUID',
  dotenv: 'dotenv',
  pino: 'Pino',
  winston: 'Winston',

  // TypeScript
  typescript: 'TypeScript',
};

// ─── Dependency Category Mappings ────────────────────────────────────────────

/** Maps npm package names to their category */
export const DEPENDENCY_CATEGORIES: Record<string, DependencyCategory> = {
  // Frameworks
  react: 'framework',
  'react-dom': 'framework',
  next: 'framework',
  vue: 'framework',
  nuxt: 'framework',
  angular: 'framework',
  '@angular/core': 'framework',
  svelte: 'framework',
  express: 'server',
  fastify: 'server',
  koa: 'server',
  hono: 'server',
  '@nestjs/core': 'server',
  '@nestjs/common': 'server',

  // UI
  tailwindcss: 'ui',
  'styled-components': 'ui',
  '@emotion/react': 'ui',
  sass: 'ui',
  '@chakra-ui/react': 'ui',
  '@mui/material': 'ui',
  antd: 'ui',

  // Testing
  jest: 'testing',
  vitest: 'testing',
  mocha: 'testing',
  cypress: 'testing',
  playwright: 'testing',
  '@playwright/test': 'testing',
  '@testing-library/react': 'testing',

  // Build
  vite: 'build',
  webpack: 'build',
  rollup: 'build',
  esbuild: 'build',
  tsup: 'build',
  turbo: 'build',
  typescript: 'build',

  // Database
  mongoose: 'database',
  prisma: 'database',
  '@prisma/client': 'database',
  typeorm: 'database',
  'drizzle-orm': 'database',
  sequelize: 'database',
  pg: 'database',
  mysql2: 'database',
  redis: 'database',
  ioredis: 'database',
};

// ─── Package Manager Lock Files ──────────────────────────────────────────────

export const LOCK_FILES: Record<string, PackageManager> = {
  'pnpm-lock.yaml': 'pnpm',
  'package-lock.json': 'npm',
  'yarn.lock': 'yarn',
  'bun.lockb': 'bun',
  'bun.lock': 'bun',
};

// ─── Shields.io Base URL ─────────────────────────────────────────────────────

export const SHIELDS_BASE_URL = 'https://img.shields.io';
export const NPM_BASE_URL = 'https://www.npmjs.com/package';
