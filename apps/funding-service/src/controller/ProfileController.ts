import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Project } from '@shared/entities';
import { ensureAuthorization } from '../modules/ensureAuthorization';
import { jwtErrorHandler } from '../modules/jwtErrorHandler';
import { HttpStatusCode } from 'axios';
import { StatusCodes } from 'http-status-codes';

// 마이페이지 - 최근 완료된 펀딩
export const getMyFundingRecentlyFinished = async (req: Request, res: Response) => {
  const getUser = ensureAuthorization(req);
  if (getUser instanceof Error) {
    return jwtErrorHandler(getUser, res);
  }

  const userId = getUser.userId;

  const projectRepo = AppDataSource.getRepository(Project);

  const query = projectRepo
    .createQueryBuilder('project')
    .select(['project.image_id', 'project.title', 'project.start_date', 'project.end_date'])
    .addSelect('FLOOR((current_amount / goal_amount)*100) AS achievement')
    .where('project.userId = :userId', { userId: userId })
    .orderBy('project.end_date', 'DESC');

  try {
    const queryResult = await query.getOne();
    if (queryResult === null) {
      return res.status(HttpStatusCode.Ok).json([]);
    }

    return res.status(HttpStatusCode.Ok).json(queryResult);
  } catch (err) {
    console.log(err);
    return res.status(HttpStatusCode.InternalServerError).json({ message: '서버 문제가 발생했습니다.' });
  }
};

// 마이페이지 - 내가 올린 펀딩 목록
export const getMyFundingList = async (req: Request, res: Response) => {
  const getUser = ensureAuthorization(req);
  if (getUser instanceof Error) {
    return jwtErrorHandler(getUser, res);
  }

  const userId = getUser.userId;

  const projectRepo = AppDataSource.getRepository(Project);

  const query = projectRepo
    .createQueryBuilder('project')
    .select(['project.image_id', 'project.title', 'project.short_description', 'project.current_amount'])
    .addSelect('FLOOR((current_amount / goal_amount)*100) AS achievement')
    .addSelect('DATEDIFF(project.end_date, NOW()) AS remaining_day')
    .where('project.userId = :userId', { userId: userId });

  try {
    const queryResult = await query.getRawMany();

    if (queryResult.length === 0) {
      return res.status(HttpStatusCode.Ok).json([]);
    }

    return res.status(StatusCodes.OK).json(queryResult);
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 문제가 발생했습니다.' });
  }
};

// 다른 회원 - 타 회원이 올린 펀딩 목록
export const getOthersFundingList = async (req: Request, res: Response) => {
  const userId = req.params.id;

  const projectRepo = AppDataSource.getRepository(Project);

  const query = projectRepo
    .createQueryBuilder('project')
    .select(['project.image_id', 'project.title', 'project.short_description', 'project.current_amount'])
    .addSelect('FLOOR((current_amount / goal_amount)*100) AS achievement')
    .addSelect('DATEDIFF(project.end_date, NOW()) AS remaining_day')
    .where('project.user_id = :userId', { userId: userId });

  try {
    const queryResult = await query.getRawMany();

    if (queryResult.length === 0) {
      return res.status(HttpStatusCode.Ok).json([]);
    }

    return res.status(StatusCodes.OK).json(queryResult);
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 문제가 발생했습니다.' });
  }
};

// 펀딩 후기
export const getFundingComments = async (req: Request, res: Response) => {
  const getToken = ensureAuthorization(req);
  if (getToken instanceof Error) {
    return jwtErrorHandler(getToken, res);
  }

  const userId = getToken.userId;

  const ProjectRepo = AppDataSource.getRepository(Project);

  const query = ProjectRepo.createQueryBuilder('project')
    .innerJoin('project.comment', 'comment')
    .select(['project.image_id AS image_id', 'project.title AS title', 'comment.content AS content'])
    .where('comment.userId = :userId', { userId: userId });

  try {
    const queryResult = await query.getRawMany();

    if (queryResult.length === 0) {
      return res.status(StatusCodes.OK).json([]);
    }

    return res.status(StatusCodes.OK).json(queryResult);
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 문제가 발생했습니다.' });
  }
};
