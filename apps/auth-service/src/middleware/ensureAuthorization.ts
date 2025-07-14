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
      const secretOrKey = process.env.JWT_PUBLIC_KEY || process.env.PRIVATE_KEY!;
      const decodedRaw = jwt.verify(token, secretOrKey);
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
