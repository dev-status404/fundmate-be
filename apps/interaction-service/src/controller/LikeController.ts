import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
//import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
//import { ensureAuthorization } from '../modules/ensureAuthorization';
import { Like } from '@shared/entities';
//import { Project } from '@shared/entities';
//import { User } from '@shared/entities';

// 좋아요 추가
export const addLike = async (req: Request, res: Response): Promise<Response | void> => {
  const projectId = parseInt(req.params.id, 10);

  const { userId } = res.locals.user;
  try {
    const likeRepo = AppDataSource.getRepository(Like);

    const newLike = likeRepo.create({
      userId: userId,
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

  const { userId } = res.locals.user;
  try {
    const likeRepo = AppDataSource.getRepository(Like);

    await likeRepo.delete({
      userId: userId,
      projectId: projectId,
    });

    return res.status(StatusCodes.OK).json({ message: '좋아요가 제거되었습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.BAD_REQUEST).json({ message: '좋아요 제거에 실패했습니다.' });
  }
};

export const myLikeList = async (req: Request, res: Response): Promise<Response | void> => {
  const { userId } = res.locals.user;

  try {
    const likeRepo = AppDataSource.getRepository(Like);
    const likes = await likeRepo.find({
      where: { userId: userId },
      relations: ['project'],
    });

    const response = likes.map((like) => ({
      project_id: like.projectId,
      title: like.project.title,
      img_id: like.project.image?.imageId,
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
