import { config, type LogLevel } from '#/config/index.ts';

const levelRank: Record<LogLevel, number> = {
   silent: 0,
   error: 1,
   warn: 2,
   info: 3,
   debug: 4,
};

export type LogContext = unknown;

function isEnabled(level: LogLevel, threshold: LogLevel): boolean {
   return levelRank[level] > 0 && levelRank[level] <= levelRank[threshold];
}

/** Write a message when its level is enabled by the configured threshold. */
export function writeLog(
   level: Exclude<LogLevel, 'silent'>,
   message: string,
   context?: LogContext,
   threshold: LogLevel = config.logLevel,
): void {
   if (!isEnabled(level, threshold)) return;

   const args = context === undefined ? [message] : [message, context];
   switch (level) {
      case 'error':
         console.error(...args);
         break;
      case 'warn':
         console.warn(...args);
         break;
      case 'info':
         console.info(...args);
         break;
      case 'debug':
         console.debug(...args);
         break;
   }
}

/** Simple level-aware logging wrappers for library messages. */
export const logger = {
   error: (message: string, context?: LogContext) =>
      writeLog('error', message, context),
   warn: (message: string, context?: LogContext) =>
      writeLog('warn', message, context),
   info: (message: string, context?: LogContext) =>
      writeLog('info', message, context),
   debug: (message: string, context?: LogContext) =>
      writeLog('debug', message, context),
};
