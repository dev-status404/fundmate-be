import { Request, Response, NextFunction } from 'express';
import StatusCode from 'http-status-codes';
import { serviceConfig, HTTPMethod, JwtRule, serviceClients } from '@shared/config';
import { jwtMiddleware } from '../middlewares/jwt-middleware';

// 서버 결정 미들웨어
export function decideService(req: Request, res: Response, next: NextFunction) {
  const service = Object.values(serviceConfig).find((s) => s.base.some((base) => req.path.startsWith(base)));
  if (!service) {
    res.status(StatusCode.NOT_FOUND).json({ message: 'Service not found' });
  }
  res.locals.service = service;
  next();
}

// 토큰 확인 여부결정 미들웨어
export function decideJwt(req: Request, res: Response, next: NextFunction) {
  const rules = res.locals.service.jwtRules;
  const rule = rules.find(
    (r: JwtRule) => (r.method === 'ALL' || r.method === req.method) && req.path.startsWith(r.path)
  ) ?? {
    required: true,
    path: '',
    method: 'ALL',
  };

  return jwtMiddleware(rule.required)(req, res, next);
}

// 라우터 미들웨어
export async function forwardRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const client = serviceClients[res.locals.service.name];
    if (res.locals.user) {
      client.setAuthContext(res.locals.user);
    }
    const response = await client.request(req.method as HTTPMethod, req.path, req.body, req.query);

    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      res.setHeader('set-cookie', setCookie).status(response.status).json(response.data);
    } else {
      res.status(response.status).json(response.data);
    }
  } catch (err) {
    next(err);
  }
}
