import { readFile, writeFile as fsWriteFile, access } from 'node:fs/promises';
import { resolve, relative, isAbsolute, sep } from 'node:path';
import { constants } from 'node:fs';
import { logger } from './logger.js';
import { LOCK_FILES } from './constants.js';
import type { PackageManager } from '../types/index.js';

// ─── Path Safety ─────────────────────────────────────────────────────────────

/**
 * Check whether `target` is the same as, or nested inside, `base`.
 */
export function isWithinDirectory(target: string, base: string): boolean {
  const rel = relative(resolve(base), resolve(target));
  return rel === '' || (rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

/**
 * Validate that a resolved path stays within the given base directory.
 * Prevents path traversal attacks.
 */
export function validatePath(filePath: string, basePath: string): string {
  const resolvedPath = resolve(basePath, filePath);

  if (!isWithinDirectory(resolvedPath, basePath)) {
    throw new Error(`Path traversal detected: "${filePath}" resolves outside the base directory.`);
  }

  return resolvedPath;
}

// ─── File Operations ─────────────────────────────────────────────────────────

/**
 * Check if a file or directory exists.
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely read a file as UTF-8 text.
 */
export async function readTextFile(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, 'utf-8');
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    if (err.code === 'EACCES') {
      throw new Error(`Permission denied: ${filePath}`);
    }
    throw new Error(`Failed to read file ${filePath}: ${err.message}`);
  }
}

/**
 * Read and parse a JSON file with error handling.
 */
export async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await readTextFile(filePath);

  try {
    return JSON.parse(content) as T;
  } catch {
    throw new Error(`Invalid JSON in ${filePath}. Please check the file syntax.`);
  }
}

/**
 * Safely write content to a file.
 */
export async function safeWriteFile(
  filePath: string,
  content: string,
  basePath: string,
): Promise<void> {
  // Ensure the resolved path is within the working directory
  const resolvedFile = resolve(basePath, filePath);
  if (!isWithinDirectory(resolvedFile, basePath)) {
    throw new Error(
      `Path traversal detected: cannot write outside the project directory: ${filePath}`,
    );
  }

  try {
    await fsWriteFile(resolvedFile, content, 'utf-8');
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EACCES') {
      throw new Error(`Permission denied when writing to: ${resolvedFile}`);
    }
    throw new Error(`Failed to write file ${resolvedFile}: ${err.message}`);
  }
}

// ─── Package Manager Detection ───────────────────────────────────────────────

/**
 * Detect the package manager used in the project by checking for lock files.
 * Priority order: pnpm > yarn > bun > npm (fallback).
 */
export async function detectPackageManager(cwd: string): Promise<PackageManager> {
  // Check lock files in priority order
  const priorityOrder: string[] = [
    'pnpm-lock.yaml',
    'yarn.lock',
    'bun.lockb',
    'bun.lock',
    'package-lock.json',
  ];

  for (const lockFile of priorityOrder) {
    const lockPath = resolve(cwd, lockFile);
    if (await fileExists(lockPath)) {
      const manager = LOCK_FILES[lockFile];
      if (manager) {
        logger.debug(`Detected package manager: ${manager} (from ${lockFile})`);
        return manager;
      }
    }
  }

  logger.debug('No lock file found, defaulting to npm');
  return 'npm';
}

/**
 * Get the install command for a given package manager.
 */
export function getInstallCommand(manager: PackageManager): string {
  const commands: Record<PackageManager, string> = {
    npm: 'npm install',
    pnpm: 'pnpm install',
    yarn: 'yarn install',
    bun: 'bun install',
  };
  return commands[manager];
}

/**
 * Get the run command prefix for a given package manager.
 */
export function getRunCommand(manager: PackageManager): string {
  const commands: Record<PackageManager, string> = {
    npm: 'npm run',
    pnpm: 'pnpm',
    yarn: 'yarn',
    bun: 'bun run',
  };
  return commands[manager];
}
