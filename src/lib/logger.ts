/**
 * Production Server Logger
 * Provides structured logging for API routes, database events, and security audits.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  message: string;
  context?: Record<string, unknown>;
  error?: unknown;
}

class Logger {
  private formatLog(level: LogLevel, payload: LogPayload) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message: payload.message,
      ...(payload.context ? { context: payload.context } : {}),
      ...(payload.error
        ? { error: payload.error instanceof Error ? payload.error.message : payload.error }
        : {}),
    };
  }

  info(message: string, context?: Record<string, unknown>) {
    console.log(JSON.stringify(this.formatLog("info", { message, context })));
  }

  warn(message: string, context?: Record<string, unknown>) {
    console.warn(JSON.stringify(this.formatLog("warn", { message, context })));
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    console.error(JSON.stringify(this.formatLog("error", { message, error, context })));
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "development") {
      console.debug(JSON.stringify(this.formatLog("debug", { message, context })));
    }
  }
}

export const logger = new Logger();
