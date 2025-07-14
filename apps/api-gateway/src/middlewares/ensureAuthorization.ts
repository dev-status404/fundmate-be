import { Request } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { DecodedJwt } from '@shared/types';
dotenv.config();

export const ensureAuthorization = (req: Request): DecodedJwt | Error => {
  try {
    const token = req.cookies?.accessToken;

    if (token) {
      const decodedJwt = jwt.verify(token, process.env.PRIVATE_KEY as String) as DecodedJwt;
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
