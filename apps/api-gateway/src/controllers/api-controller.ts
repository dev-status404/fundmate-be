import { Request, Response, NextFunction } from 'express';
import StatusCode from 'http-status-codes';
import { serviceConfig, HTTPMethod, JwtRule } from '@shared/config';
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
  console.log(req.path, req.method);
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
    const headers = { ...req.headers };
    if (res.locals.user) {
      headers['authorization'] = `Bearer ${res.locals.user.token}`;
      headers['x-user-id'] = String(res.locals.user.userId);
      headers['x-user-email'] = String(res.locals.user.email);
    }
    const { status, data } = await res.locals.client.request(
      req.method as HTTPMethod,
      req.path.replace(res.locals.client.config.base[0], ''),
      req.body,
      req.query,
      { headers, withCredentials: true }
    );
    res.status(status).send(data);
  } catch (err) {
    next(err);
  }
}
