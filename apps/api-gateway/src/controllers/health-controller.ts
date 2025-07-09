import { Request, Response } from 'express';
import StatusCode from 'http-status-codes';
import { checkAllServices, HealthResult } from '../services/health-service';

export const healthCheck = async (_req: Request, res: Response) => {
  const results: HealthResult[] = await checkAllServices();
  const overall = results.every((r) => r.status === 'ok') ? 'ok' : 'degraded';
  res.status(overall === 'ok' ? StatusCode.OK : StatusCode.INTERNAL_SERVER_ERROR).json({ overall, services: results });
};
