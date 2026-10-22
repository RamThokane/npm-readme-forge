import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, setVerbose, isVerbose } from '../../src/utils/logger.js';

describe('logger', () => {
  let log: ReturnType<typeof vi.spyOn>;
  let error: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    log = vi.spyOn(console, 'log').mockImplementation(() => {});
    error = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    setVerbose(false);
    vi.restoreAllMocks();
  });

  it('should write info, success, warn and blank to stdout', () => {
    logger.info('i');
    logger.success('s');
    logger.warn('w');
    logger.blank();
    expect(log).toHaveBeenCalledTimes(4);
  });

  it('should write errors to stderr', () => {
    logger.error('e');
    expect(error).toHaveBeenCalledTimes(1);
  });

  it('should only print debug messages in verbose mode', () => {
    logger.debug('hidden');
    expect(log).not.toHaveBeenCalled();

    setVerbose(true);
    expect(isVerbose()).toBe(true);
    logger.debug('shown');
    expect(log).toHaveBeenCalledTimes(1);
  });
});
