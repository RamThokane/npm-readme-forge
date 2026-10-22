import { resolve } from 'node:path';
import ora from 'ora';
import chalk from 'chalk';
import { ReadmeConfigSchema } from '../types/index.js';
import type { ReadmeConfig } from '../types/index.js';
import { ReadmeGenerator } from '../generators/readmeGenerator.js';
import { safeWriteFile } from '../utils/fs.js';
import { logger } from '../utils/logger.js';

// ─── Generate Command ────────────────────────────────────────────────────────

export async function generateCommand(rawOptions: Partial<ReadmeConfig>): Promise<void> {
  const cwd = process.cwd();

  try {
    // Validate options
    const config = ReadmeConfigSchema.parse(rawOptions);

    logger.debug(`Working directory: ${cwd}`);
    logger.debug(`Template: ${config.template}`);
    logger.debug(`Output: ${config.output}`);

    // Start spinner
    const spinner = ora({
      text: chalk.cyan('Analyzing your project...'),
      color: 'magenta',
    }).start();

    // Generate README
    const generator = new ReadmeGenerator(config);

    let result;
    try {
      result = await generator.generate(cwd);
      spinner.succeed(chalk.green('Analysis complete!'));
    } catch (error) {
      spinner.fail(chalk.red('Analysis failed'));
      throw error;
    }

    // Write the file
    const writingSpinner = ora({
      text: chalk.cyan(`Writing ${config.output}...`),
      color: 'magenta',
    }).start();

    try {
      const outputPath = resolve(cwd, config.output);
      await safeWriteFile(outputPath, result.markdown, cwd);
      writingSpinner.succeed(chalk.green(`README written to ${chalk.bold(config.output)}`));
    } catch (error) {
      writingSpinner.fail(chalk.red('Failed to write README'));
      throw error;
    }

    // Summary
    logger.blank();
    console.log(chalk.gray('  ─────────────────────────────────'));
    console.log(chalk.white(`  📄 Template:   ${chalk.bold(config.template)}`));
    console.log(
      chalk.white(
        `  📏 Size:       ${chalk.bold(formatBytes(Buffer.byteLength(result.markdown, 'utf-8')))}`,
      ),
    );
    console.log(chalk.white(`  🕐 Generated:  ${chalk.bold(new Date().toLocaleTimeString())}`));
    console.log(chalk.gray('  ─────────────────────────────────'));
    logger.blank();
    logger.success('Done! Your README is ready. 🎉');
  } catch (error) {
    handleError(error);
    process.exitCode = 1;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function handleError(error: unknown): void {
  logger.blank();

  if (error instanceof Error) {
    const message = error.message;

    // Friendly error messages for common cases
    if (message.includes('File not found') && message.includes('package.json')) {
      logger.error('No package.json found in the current directory.');
      logger.info('Make sure you run forge-readme in a Node.js project root.');
      return;
    }

    if (message.includes('Invalid JSON')) {
      logger.error('Your package.json contains invalid JSON.');
      logger.info('Please fix the syntax errors and try again.');
      return;
    }

    if (message.includes('Permission denied')) {
      logger.error('Permission denied. Cannot read or write files.');
      logger.info('Check file permissions and try again.');
      return;
    }

    if (message.includes('Path traversal')) {
      logger.error('Invalid output path detected.');
      logger.info('The output path must be within the project directory.');
      return;
    }

    logger.error(message);
  } else {
    logger.error('An unexpected error occurred.');
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}
