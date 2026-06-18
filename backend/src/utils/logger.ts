import env from '@config/env';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const COLORS = {
  error: '\x1b[31m', // Red
  warn: '\x1b[33m', // Yellow
  info: '\x1b[36m', // Cyan
  debug: '\x1b[35m', // Magenta
  reset: '\x1b[0m', // Reset
};

const currentLogLevel = LOG_LEVELS[env.LOG_LEVEL];

const formatTimestamp = (): string => {
  return new Date().toISOString();
};

const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] <= currentLogLevel;
};

const formatMessage = (level: LogLevel, message: string): string => {
  const color = COLORS[level];
  const reset = COLORS.reset;
  const timestamp = formatTimestamp();
  const levelUpper = level.toUpperCase();

  return `${color}[${timestamp}] [${levelUpper}]${reset} ${message}`;
};

const logger = {
  error: (message: string, error?: Error | unknown): void => {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message));
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
        });
      } else if (error) {
        console.error('Error details:', error);
      }
    }
  },

  warn: (message: string, data?: unknown): void => {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message));
      if (data) console.warn('Details:', data);
    }
  },

  info: (message: string, data?: unknown): void => {
    if (shouldLog('info')) {
      console.log(formatMessage('info', message));
      if (data) console.log('Details:', data);
    }
  },

  debug: (message: string, data?: unknown): void => {
    if (shouldLog('debug')) {
      console.log(formatMessage('debug', message));
      if (data) console.log('Details:', JSON.stringify(data, null, 2));
    }
  },
};

export default logger;
