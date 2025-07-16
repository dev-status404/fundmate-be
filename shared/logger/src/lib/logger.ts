import pino from 'pino';
import pinoHttp from 'pino-http';

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

// log에 불필요한 url
const skipUrlsSet = new Set(['/health-checks', '/health', '/favicon.ico', '/assets', '/docs']);

export const httpLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => skipUrlsSet.has(req.url as string),
  },
  serializers: {
    req(req) {
      return { method: req.method, url: req.url, headers: req.headers };
    },
    res(res) {
      return { statusCode: res.statusCode };
    },
  },
});
