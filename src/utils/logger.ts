import chalk from 'chalk';

// ─── Logger State ────────────────────────────────────────────────────────────

let verbose = false;

// ─── Public API ──────────────────────────────────────────────────────────────

export function setVerbose(enabled: boolean): void {
  verbose = enabled;
}

export function isVerbose(): boolean {
  return verbose;
}

export const logger = {
  info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  },

  success(message: string): void {
    console.log(chalk.green('✔'), message);
  },

  warn(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  },

  error(message: string): void {
    console.error(chalk.red('✖'), message);
  },

  debug(message: string): void {
    if (verbose) {
      console.log(chalk.gray('⋯'), chalk.gray(message));
    }
  },

  blank(): void {
    console.log();
  },
};
