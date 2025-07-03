import { Request, Response, NextFunction } from 'express';
import { getHealthInfo } from '../services/health-service';

export function healthHandler(req: Request, res: Response, next: NextFunction): void {
  try {
    const healthInfo = getHealthInfo();
    res.status(200).json(healthInfo);
  } catch (error) {
    next(error);
  }
}
