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

export const httpLogger = pinoHttp({
  logger,
  autoLogging: { ignore: (req) => req.url === '/health-check' || req.url === '/health' },
  serializers: {
    req(req) {
      return { method: req.method, url: req.url, headers: req.headers };
    },
    res(res) {
      return { statusCode: res.statusCode };
    },
  },
});
