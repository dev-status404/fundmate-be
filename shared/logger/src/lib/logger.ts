import pino from 'pino';
import pinoHttp from 'pino-http';
import { IncomingMessage } from 'http';
import { Request } from 'express';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'production'
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: false,
            translateTime: 'HH:MM',
            ignore: 'pid,hostname',
            singleLine: true,
          },
        },
});

const skipPrefixes = ['/assets', '/docs'];
const skipExact = new Set(['/health-checks', '/health', '/favicon.ico']);

export const httpLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => {
      const url = req.url || '';
      return skipExact.has(url) || skipPrefixes.some((p) => url.startsWith(p));
    },
  },
  serializers: {
    req: () => undefined,
    res: () => undefined,
  },
  customReceivedMessage: (rawReq: IncomingMessage, _res) => {
    const req = rawReq as Request;
    const parts = [`[REQUEST] ${req.method}: ${req.url}`];
    if (req.query && Object.keys(req.query).length > 0) {
      parts.push(`query=${JSON.stringify(req.query)}`);
    }
    if (req.body && Object.keys(req.body).length > 0) {
      parts.push(`body=${JSON.stringify(req.body)}`);
    }
    return parts.join('\n') + '\n';
  },
  customSuccessMessage: (req, res, responseTime) =>
    `[SUCCESS] (${res.statusCode}) ${req.method}: ${req.url} in ${responseTime}ms`,
  customErrorMessage: (req, res, err) => `[ERROR] (${res.statusCode}) ${req.method}: ${req.url} → ${err.message}`,
  customLogLevel: (req, res) => {
    if (res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});