import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { ensureAuthorization } from '../modules/ensureAuthorization';
import { Like, Comment } from '@shared/entities';
import { Equal } from 'typeorm';
export const interactMain = async (req: Request, res: Response): Promise<Response | void> => {
  const authorization = ensureAuthorization(req);

  if (authorization instanceof Error) {
    if (authorization instanceof TokenExpiredError) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: '로그인 세션이 만료되었습니다. 다시 로그인하세요.' });
    } else if (authorization instanceof JsonWebTokenError) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: '잘못된 토큰입니다.' });
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: '인증되지 않은 사용자입니다.' });
    }
  }

  try {
    const likeRepo = AppDataSource.getRepository(Like);
    const commentRepo = AppDataSource.getRepository(Comment);

    const [likeCount, commentCount] = await Promise.all([
      likeRepo.count({ where: { userId: authorization.userId } }),
      commentRepo.count({ where: { userId: Equal(authorization.userId) } }),
    ]);

    return res.status(StatusCodes.OK).json({ likeCount, commentCount });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '정보 조회 실패' });
  }
};
export default {
  interactMain,
};
