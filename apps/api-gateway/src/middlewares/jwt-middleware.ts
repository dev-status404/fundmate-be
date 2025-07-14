import { Request, Response, NextFunction } from 'express';
import { ensureAuthorization } from './ensureAuthorization';
import { jwtErrorHandler } from './jwtErrorHandler';
import { StatusCodes } from 'http-status-codes';

export function jwtMiddleware(required: boolean) {
  return (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken && !refreshToken) {
      if (required) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: '로그인이 필요합니다.' });
      }
      return next();
    }

    const result = ensureAuthorization(req);
    if (result instanceof Error) {
      if (required) return jwtErrorHandler(result, res);
      return next();
    } else {
      res.locals.user = { userId: result.userId, email: result.email, accessToken, refreshToken };
      return next();
    }
  };
}
