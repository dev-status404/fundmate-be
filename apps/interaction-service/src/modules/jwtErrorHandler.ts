// [NOTE] 임시로 funding 폴더에 파일을 복제 -> share 공용 폴더에 정리할 예정

import { Response } from 'express';
import jwt from 'jsonwebtoken';
import StatusCode from 'http-status-codes';

export const jwtErrorHandler = (err: Error, res: Response) => {
  if (err instanceof jwt.TokenExpiredError || err instanceof jwt.JsonWebTokenError || err instanceof ReferenceError) {
    return res.status(StatusCode.UNAUTHORIZED).json({ message: '로그인이 필요합니다.' });
  } else {
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: '서버 문제가 발생했습니다. - token 문제' });
  }
};
