import { Request, Response, NextFunction } from 'express';
import StatusCode from 'http-status-codes';
import { serviceConfig } from '@shared/config';
import { proxyRequest } from '../services/proxy-service';

export function detectService(req: Request, res: Response, next: NextFunction) {
  const service = Object.values(serviceConfig).find((s) => s.base.some((base) => req.path.startsWith(base)));
  if (!service) {
    res.status(StatusCode.NOT_FOUND).json({ message: 'Service not found' });
  }
  res.locals.service = service;
  next();
}

export async function forwardRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, data } = await proxyRequest(res.locals.service, req);
    res.status(status).send(data);
  } catch (err) {
    next(err);
  }
}
