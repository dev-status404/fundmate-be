import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { serviceConfig, ServiceConfig, JwtRule } from '@shared/config';
import StatusCode from 'http-status-codes';
import { jwtMiddleware } from '../middlewares/jwt-middleware';

declare module 'express-serve-static-core' {
  interface ResponseLocals {
    service: ServiceConfig;
  }
}

const router = Router();

// 서비스 판별
router.use((req: Request, res: Response, next: NextFunction) => {
  const service = Object.values(serviceConfig).find((service) =>
    service.base.some((basePath) => req.path.startsWith(basePath))
  );
  if (!service) {
    return res.status(StatusCode.NOT_FOUND).json({ message: 'Service not found' });
  }
  res.locals.service = service;
  return next();
});

// JWT 검증 밒 targetURL 넘기기
router.use((req: Request, res: Response, next: NextFunction) => {
  const svc = res.locals.service;
  const rule = svc.jwtRules.find((r: JwtRule) => {
    const re = r.path;
    const methodMatch = r.method === 'ALL' || r.method === req.method;
    return methodMatch && re == req.path;
  }) as JwtRule | undefined;

  if (rule) {
    return jwtMiddleware(rule.required);
  }

  return next();
});

router.all('/*', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url } = res.locals.service;
    const targetUrl = `${url}${req.originalUrl}`;
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: req.headers,
      data: req.body,
    });
    return res.status(response.status).send(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).send(error.response.data);
    } else {
      return next(error);
    }
  }
});

export default router;
