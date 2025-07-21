import { Request, Response, NextFunction } from 'express';
import { getHealthInfo } from '../../services/health-service';
import { StatusCodes } from 'http-status-codes';

export function healthHandler(req: Request, res: Response, next: NextFunction): void {
  try {
    const healthInfo = getHealthInfo();
    res.status(StatusCodes.OK).json(healthInfo);
  } catch (error) {
    next(error);
  }
}
