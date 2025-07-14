// [NOTE] 임시로 funding 폴더에 파일을 복제 -> share 공용 폴더에 정리할 예정

import { Request } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface DecodedJwt {
  userId: number;
  email: string;
}

export const ensureAuthorization = (req: Request): DecodedJwt | Error => {
  try {
    const token = req.header('x-access-token');

    if (token) {
      const decodedJwt = jwt.verify(token, process.env.PRIVATE_KEY as string) as DecodedJwt;
      return decodedJwt;
    } else {
      throw new ReferenceError('JWT must be provided');
    }
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.name);
      console.log(err.message);
      return err;
    }

    console.log('Unknown error', err);
    return new Error('알 수 없는 에러가 발생했습니다.');
  }
};
