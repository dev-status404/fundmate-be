import { Request, Response, NextFunction } from 'express';
import StatusCode from 'http-status-codes';
import { serviceConfig, HTTPMethod, JwtRule, serviceClients } from '@shared/config';
import { jwtMiddleware } from '../middlewares/jwt-middleware';

function pathToRegExp(path: string): RegExp {
  const escaped = path.replace(/([.+?^=!:${}()|[\]\\/])/g, '\\$1');
  const replaced = escaped.replace(/\\:([^\\/]+)/g, '[^/]+');
  return new RegExp(`^${replaced}(?:/.*)?$`);
}

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
  const candidates = rules
    .filter((r: JwtRule) => (r.method === 'ALL' || r.method === req.method) && pathToRegExp(r.path).test(req.path))
    .sort((a: JwtRule, b: JwtRule) => b.path.length - a.path.length);
  const rule = candidates[0] ?? { required: false, path: '', method: 'ALL' };

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
