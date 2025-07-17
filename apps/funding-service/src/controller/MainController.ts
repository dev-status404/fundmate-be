import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Project } from '@shared/entities';
import { HttpStatusCode } from 'axios';

type ProjectType = {
  imageUrl: string;
  title: string;
  shortDescription: string;
  goalAmount: number;
  currentAmount: number;
  achievement: number;
  remainingDay: number;
};

// [todo] 중복 코드 모듈화

// 전체 프로젝트 조회 (메인 화면)
export const getAllProjects = async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
  const projectRepo = AppDataSource.getRepository(Project);

  const query = projectRepo
    .createQueryBuilder('project')
    .select([
      'project.projectId AS project_id',
      'project.image_url AS image_url',
      'project.title AS title',
      'project.shortDescription AS short_description',
      'project.goalAmount AS goal_amount',
      'project.currentAmount AS current_amount',
      'FLOOR((current_amount / goal_amount)*100) AS achievement',
    ])
    .addSelect('DATEDIFF(project.end_date, NOW()) AS remaining_day');

  if (limit) {
    query.take(limit);
  }

  try {
    const queryResult: ProjectType[] = await query.getRawMany();

    if (queryResult.length === 0) {
      return res.status(HttpStatusCode.Ok).json([]);
    }

    return res.status(HttpStatusCode.Ok).json(
      queryResult.map((item) => ({
        ...item,
        achievement: Number(item.achievement),
      })));
  } catch (err) {
    console.error(err);
    return res.status(HttpStatusCode.InternalServerError).json({ message: '서버 문제가 발생했습니다.' });
  }
};

// 최근 조회한 프로젝트 목록
export const getRecentlyViewedFundingList = async (req: Request, res: Response) => {
  let projectIds = req.query.project_id;

  if (!projectIds) {
    return res.status(HttpStatusCode.Ok).json([]);
  }

  if (typeof projectIds === 'string') {
    projectIds = [projectIds];
  }

  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
  const projectRepo = AppDataSource.getRepository(Project);

  const query = projectRepo
    .createQueryBuilder('project')
    .select([
      'project.projectId AS project_id',
      'project.image_url AS imageUrl',
      'project.title AS title',
      'project.shortDescription AS shortDescription',
      'project.goalAmount AS goalAmount',
      'project.currentAmount AS currentAmount',
      'FLOOR((current_amount / goal_amount)*100) AS achievement',
    ])
    .addSelect('DATEDIFF(project.end_date, NOW()) AS remainingDay')
    .where('project.projectId IN (:...projectIds)', { projectIds });

  if (limit) {
    query.take(limit);
  }

  try {
    const queryResult: ProjectType[] = await query.getRawMany();

    if (queryResult.length === 0) {
      return res.status(HttpStatusCode.Ok).json([]);
    }

    return res.status(HttpStatusCode.Ok).json(
      queryResult.map((item) => ({
        ...item,
        achievement: Number(item.achievement),
      }))
    );
  } catch (err) {
    console.error(err);
    return res.status(HttpStatusCode.InternalServerError).json({ message: '서버 문제가 발생했습니다.' });
  }
};

// 마감 임박 프로젝트 목록
export const getDeadlineFundingList = async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
  const projectRepo = AppDataSource.getRepository(Project);

  const query = projectRepo
    .createQueryBuilder('project')
    .select([
      'project.projectId AS project_id',
      'project.image_url AS image_url',
      'project.title AS title',
      'project.shortDescription AS short_description',
      'project.goalAmount AS goal_amount',
      'project.currentAmount AS current_amount',
    ])
    .addSelect('DATEDIFF(project.end_date, NOW()) AS remaining_day')
    .orderBy('project.end_date', 'DESC');

  if (limit) {
    query.take(limit);
  }

  try {
    const queryResult: ProjectType[] = await query.getRawMany();

    if (queryResult.length === 0) {
      return res.status(HttpStatusCode.Ok).json([]);
    }

    return res.status(HttpStatusCode.Ok).json(queryResult);
  } catch (err) {
    console.error(err);
    return res.status(HttpStatusCode.InternalServerError).json({ message: '서버 문제가 발생했습니다.' });
  }
};

// 신규 프로젝트 목록
export const getNewFundingList = async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
  const projectRepo = AppDataSource.getRepository(Project);

  const query = projectRepo
    .createQueryBuilder('project')
    .select([
      'project.projectId AS project_id',
      'project.image_url AS image_url',
      'project.title AS title',
      'project.shortDescription AS short_description',
      'project.goalAmount AS goal_amount',
      'project.currentAmount AS current_amount',
    ])
    .addSelect('DATEDIFF(project.created_at, NOW()) AS created_before')
    .addSelect('DATEDIFF(project.end_date, NOW()) AS remaining_day')
    .orderBy('project.created_at', 'DESC');

  if (limit) {
    query.take(limit);
  }

  try {
    const queryResult: ProjectType[] = await query.getRawMany();

    if (queryResult.length === 0) {
      return res.status(HttpStatusCode.Ok).json([]);
    }

    return res.status(HttpStatusCode.Ok).json(queryResult);
  } catch (err) {
    console.error(err);
    return res.status(HttpStatusCode.InternalServerError).json({ message: '서버 문제가 발생했습니다.' });
  }
};

// 인기 프로젝트 목록
export const getPopularFundingList = async (req: Request, res: Response) => {
  const projectRepo = AppDataSource.getRepository(Project);
  const query = projectRepo
    .createQueryBuilder('project')
    .leftJoin('project.likes', 'like')
    .select([
      'project.projectId AS project_id',
      'project.image_url AS image_url',
      'project.title AS title',
      'project.shortDescription AS short_description',
      'project.currentAmount AS current_amount',
      'DATEDIFF(project.end_date, NOW()) AS remaining_day',
    ])
    .addSelect('FLOOR((project.currentAmount / project.goalAmount) * 100)', 'achievement')
    .groupBy('project.projectId')
    .where('end_date > NOW()')
    .orderBy('COUNT(like.project_id)', 'DESC')
    .limit(8);

  try {
    const result = await query.getRawMany();

    if (result.length == 0) {
      return res.status(HttpStatusCode.Ok).json([]);
    }

    return res.status(HttpStatusCode.Ok).json(result);
  } catch (err) {
    console.error(err);
    return res.status(HttpStatusCode.InternalServerError).json({ message: '서버 문제가 발생했습니다.' });
  }
};

// 카테고리별 프로젝트 목록
export const getFundingListByCategoryId = async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
  const categoryId = req.params.id;
  const projectRepo = AppDataSource.getRepository(Project);

  if (!categoryId) {
    return res.status(HttpStatusCode.BadRequest).json({ message: '카테고리 ID를 입력해주세요.' });
  }

  const query = projectRepo
    .createQueryBuilder('project')
    .select([
      'project.projectId AS project_id',
      'project.image_url AS image_url',
      'project.title AS title',
      'project.shortDescription AS short_description',
      'project.goalAmount AS goal_amount',
      'project.currentAmount AS current_amount',
    ])
    .addSelect('DATEDIFF(project.end_date, NOW()) AS remaining_day')
    .where('project.category_id = :categoryId', { categoryId: parseInt(categoryId) });

  if (limit) {
    query.take(limit);
  }

  try {
    const queryResult: ProjectType[] = await query.getRawMany();

    if (queryResult.length === 0) {
      return res.status(HttpStatusCode.Ok).json([]);
    }

    return res.status(HttpStatusCode.Ok).json(queryResult);
  } catch (err) {
    console.error(err);
    return res.status(HttpStatusCode.InternalServerError).json({ message: '서버 문제가 발생했습니다.' });
  }
};
