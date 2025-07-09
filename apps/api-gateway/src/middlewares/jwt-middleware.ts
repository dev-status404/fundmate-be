import { Request, Response, NextFunction } from 'express';
import { ensureAuthorization, DecodedJwt } from './ensureAuthorization';
import { jwtErrorHandler } from './jwtErrorHandler';
import { StatusCodes } from 'http-status-codes';

export interface AuthRequest extends Request {
  user?: DecodedJwt;
}

export function jwtMiddleware(required: boolean) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken;

    if (!token) {
      if (required) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: '로그인이 필요합니다.' });
      }
      return next();
    }

    const result = ensureAuthorization(req);
    if (result instanceof Error) {
      if (required) {
        return jwtErrorHandler(result, res);
      }
      return next();
    }

    (req as AuthRequest).user = result;
    return next();
  };
}
