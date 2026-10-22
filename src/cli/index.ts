import { Command } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import { PACKAGE_NAME, VERSION, DESCRIPTION } from '../utils/constants.js';
import { setVerbose } from '../utils/logger.js';
import { generateCommand } from './commands.js';

// ─── CLI Entry Point ─────────────────────────────────────────────────────────

const program = new Command();

program
  .name(PACKAGE_NAME)
  .description(DESCRIPTION)
  .version(VERSION, '-v, --version', 'Display the current version');

// Default: generate command
program
  .command('generate', { isDefault: true })
  .description('Generate a README.md file for the current project')
  .option(
    '-t, --template <template>',
    'README template to use (default, professional)',
    'professional',
  )
  .option('-o, --output <path>', 'Output file path', 'README.md')
  .option('--no-badges', 'Exclude badges from the README')
  .option('--no-scripts', 'Exclude scripts section from the README')
  .option('--no-deps', 'Exclude dependencies section from the README')
  .option('--verbose', 'Enable verbose logging', false)
  .action(async (options) => {
    // Show banner
    const banner = boxen(
      chalk.bold.hex('#7C3AED')(`✨ ${PACKAGE_NAME} v${VERSION}`) + '\n' + chalk.gray(DESCRIPTION),
      {
        padding: 1,
        margin: { top: 1, bottom: 1, left: 0, right: 0 },
        borderStyle: 'round',
        borderColor: '#7C3AED',
      },
    );
    console.log(banner);

    // Set verbose mode
    if (options.verbose) {
      setVerbose(true);
    }

    await generateCommand({
      template: options.template,
      output: options.output,
      includeBadges: options.badges !== false,
      includeScripts: options.scripts !== false,
      includeDependencies: options.deps !== false,
      verbose: options.verbose ?? false,
    });
  });

// Parse and execute
program.parse();
