import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { ensureAuthorization } from '../modules/ensureAuthorization';
import { Like } from '@shared/entities';
//import { Project } from '@shared/entities';
//import { User } from '@shared/entities';

// 좋아요 추가
export const addLike = async (req: Request, res: Response): Promise<Response | void> => {
  const projectId = parseInt(req.params.id, 10);
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

    const newLike = likeRepo.create({
      userId: authorization.userId,
      projectId: projectId,
    });

    await likeRepo.save(newLike);
    return res.status(StatusCodes.OK).json({ message: '좋아요가 추가되었습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.BAD_REQUEST).json({ message: '좋아요 추가에 실패했습니다.' });
  }
};

// 좋아요 제거
export const removeLike = async (req: Request, res: Response): Promise<Response | void> => {
  const projectId = parseInt(req.params.id, 10);
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

    await likeRepo.delete({
      userId: authorization.userId,
      projectId: projectId,
    });

    return res.status(StatusCodes.OK).json({ message: '좋아요가 제거되었습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.BAD_REQUEST).json({ message: '좋아요 제거에 실패했습니다.' });
  }
};

export const myLikeList = async (req: Request, res: Response): Promise<Response | void> => {
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
    const likes = await likeRepo.find({
      where: { userId: authorization.userId },
      relations: ['project'],
    });

    const response = likes.map((like) => ({
      project_id: like.projectId,
      title: like.project.title,
      img_id: like.project.image,
      current_amount: like.project.currentAmount,
      goal_amount: like.project.goalAmount,
      description: like.project.description,
    }));

    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.BAD_REQUEST).json({ message: '좋아요 목록 조회에 실패했습니다.' });
  }
};

export default {
  addLike,
  removeLike,
  myLikeList,
};
