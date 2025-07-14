import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

export const jwtErrorHandler = (err: Error, res: Response) => {
  if (err instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: '토큰 만료' });
  } else if (err instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: '유효하지 않은 토큰' });
  } else if (err instanceof ReferenceError) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: '로그인 필요' });
  } else {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'JWT 처리 중 알 수 없는 오류 발생' });
  }
};
