import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
//import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
//import { ensureAuthorization } from '../modules/ensureAuthorization';
import { Like, Comment } from '@shared/entities';
import { Equal } from 'typeorm';
export const interactMain = async (req: Request, res: Response): Promise<Response | void> => {
  const { userId } = res.locals.user;
  try {
    const likeRepo = AppDataSource.getRepository(Like);
    const commentRepo = AppDataSource.getRepository(Comment);

    const [likeCount, commentCount] = await Promise.all([
      likeRepo.count({ where: { userId: userId } }),
      commentRepo.count({ where: { userId: Equal(userId) } }),
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
