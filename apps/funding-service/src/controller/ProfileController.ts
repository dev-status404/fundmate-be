import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Project } from '@shared/entities';
import { HttpStatusCode } from 'axios';
import { StatusCodes } from 'http-status-codes';

// 마이페이지 - 최근 완료된 펀딩
export const getMyFundingRecentlyFinished = async (req: Request, res: Response) => {
  const { userId } = res.locals.user;

  const projectRepo = AppDataSource.getRepository(Project);

  const query = projectRepo
    .createQueryBuilder('project')
    .leftJoin('project.paymentSchedule', 'schedule')
    .select([
      'project.image_url',
      'project.title',
      'DATE(CONVERT_TZ(project.start_date, "+00:00", "+09:00")) AS start_date',
      'DATE(CONVERT_TZ(project.end_date, "+00:00", "+09:00")) AS end_date',
      'FLOOR((current_amount / goal_amount)*100) AS achievement',
      'project.currentAmount AS current_amount',
      'COUNT(schedule.payment_info_id) AS sponsor',
    ])
    .where('project.user_id = :userId', { userId: userId })
    .andWhere('project.is_active = 0')
    .orderBy('project.end_date', 'DESC');

  try {
    const queryResult = await query.getRawOne();
    if (queryResult === null) {
      return res.status(HttpStatusCode.Ok).json([]);
    }

    return res.status(HttpStatusCode.Ok).json({
      ...queryResult,
      sponsor: Number(queryResult?.sponsor),
      achievement: Number(queryResult?.achievement)
    });
  } catch (err) {
    console.error(err);
    return res.status(HttpStatusCode.InternalServerError).json({ message: '서버 문제가 발생했습니다.' });
  }
};

// 마이페이지 - 내가 올린 펀딩 목록
export const getMyFundingList = async (req: Request, res: Response) => {
  const { userId } = res.locals.user;

  const projectRepo = AppDataSource.getRepository(Project);

  const query = projectRepo
    .createQueryBuilder('project')
    .select(['project.image_url', 'project.title', 'project.short_description', 'project.current_amount', 'FLOOR((current_amount / goal_amount)*100) AS achievement', 'GREATEST(DATEDIFF(project.end_date, NOW()), 0) AS remaining_day'])
    .where('project.user_id = :userId', { userId: userId });

  try {
    const queryResult = await query.getRawMany();

    if (queryResult.length === 0) {
      return res.status(HttpStatusCode.Ok).json([]);
    }

    return res.status(StatusCodes.OK).json(
    queryResult.map((item) => ({
      ...item,
      achievement: Number(item.achievement),
      remaining_day: Number(item.remaining_day),
      current_amount: Number(item.current_amount),
    }))
  );
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 문제가 발생했습니다.' });
  }
};

// 다른 회원 - 타 회원이 올린 펀딩 목록
export const getOthersFundingList = async (req: Request, res: Response) => {
  const userId = req.params.id;

  const projectRepo = AppDataSource.getRepository(Project);

  const query = projectRepo
    .createQueryBuilder('project')
    .select(['project.image_url', 'project.title', 'project.short_description', 'project.current_amount'])
    .addSelect('FLOOR((current_amount / goal_amount)*100) AS achievement')
    .addSelect('GREATEST(DATEDIFF(project.end_date, NOW()), 0) AS remaining_day')
    .where('project.user_id = :userId', { userId: userId });

  try {
    const queryResult = await query.getRawMany();

    if (queryResult.length === 0) {
      return res.status(HttpStatusCode.Ok).json([]);
    }

    queryResult.map((item) => ({
      ...item,
      achievement: Number(item.achievement),
      remaining_day: Number(item.remaining_day),
      current_amount: Number(item.current_amount),
    }))
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 문제가 발생했습니다.' });
  }
};

// 펀딩 후기
export const getFundingComments = async (req: Request, res: Response) => {
  const { userId } = res.locals.user;

  const ProjectRepo = AppDataSource.getRepository(Project);

  const query = ProjectRepo.createQueryBuilder('project')
    .innerJoin('project.comments', 'comment')
    .select(['project.image_url AS image_url', 'project.title AS title', 'comment.content AS content'])
    .where('comment.user_id = :userId', { userId: userId });

  try {
    const queryResult = await query.getRawMany();

    if (queryResult.length === 0) {
      return res.status(StatusCodes.OK).json([]);
    }

    return res.status(StatusCodes.OK).json(queryResult);
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 문제가 발생했습니다.' });
  }
};
