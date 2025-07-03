import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Project } from '@shared/entities';
import { StatusCodes } from 'http-status-codes';

type ProjectType = {
  title: string;
  shortDescription: string;
  goalAmount: number;
  currentAmount: number;
  achievement: number;
  remainingDay: number;
};

export const getAllProjects = async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
  const projectRepo = AppDataSource.getRepository(Project);

  const query = projectRepo
    .createQueryBuilder('project')
    .select([
      'project.title AS title',
      'project.shortDescription AS shortDescription',
      'project.goalAmount AS goalAmount',
      'project.currentAmount AS currentAmount',
    ])
    .addSelect('DATEDIFF(project.end_date, NOW()) AS remainingDay');

  if (limit) {
    query.take(limit);
  }

  try {
    const queryResult: ProjectType[] = await query.getRawMany();

    if (queryResult.length === 0) {
      return res.status(StatusCodes.NO_CONTENT).json(queryResult);
    }

    const result = queryResult.map((row) => {
      const achievement = (row.currentAmount / row.goalAmount) * 100;

      return {
        title: row.title,
        short_description: row.shortDescription,
        achievement: achievement,
        current_amount: row.currentAmount,
        remaining_day: row.remainingDay,
      };
    });

    return res.status(StatusCodes.OK).json(result);
  } catch (err) {
    console.log(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 문제가 발생했습니다 🥲' });
  }
};

export const getRecentlyViewedFundingList = async (req: Request, res: Response) => {
  let projectIds = req.query.project_id;

  if (!projectIds) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: '최근 조회한 프로젝트 ID가 없습니다 🥲' });
  }

  if (typeof projectIds === 'string') {
    projectIds = [projectIds];
  }

  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
  const projectRepo = AppDataSource.getRepository(Project);

  const query = projectRepo
    .createQueryBuilder('project')
    .select([
      'project.title AS title',
      'project.shortDescription AS shortDescription',
      'project.goalAmount AS goalAmount',
      'project.currentAmount AS currentAmount',
    ])
    .addSelect('DATEDIFF(project.end_date, NOW()) AS remainingDay')
    .where('project.projectId IN (:...projectIds)', { projectIds });

  if (limit) {
    query.take(limit);
  }

  try {
    const queryResult: ProjectType[] = await query.getRawMany();

    if (queryResult.length === 0) {
      return res.status(StatusCodes.NO_CONTENT).json(queryResult);
    }

    const result = queryResult.map((row) => {
      const achievement = (row.currentAmount / row.goalAmount) * 100;

      return {
        title: row.title,
        short_description: row.shortDescription,
        achievement: achievement,
        current_amount: row.currentAmount,
        remaining_day: row.remainingDay,
      };
    });

    return res.status(StatusCodes.OK).json(result);
  } catch (err) {
    console.log(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 문제가 발생했습니다 🥲' });
  }
};

export const getDeadlineFundingList = async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
  const projectRepo = AppDataSource.getRepository(Project);

  const query = projectRepo
    .createQueryBuilder('project')
    .select([
      'project.title AS title',
      'project.shortDescription AS shortDescription',
      'project.goalAmount AS goalAmount',
      'project.currentAmount AS currentAmount',
    ])
    .addSelect('DATEDIFF(project.end_date, NOW()) AS remainingDay')
    .orderBy('project.end_date', 'DESC');

  if (limit) {
    query.take(limit);
  }

  try {
    const queryResult: ProjectType[] = await query.getRawMany();

    if (queryResult.length === 0) {
      return res.status(StatusCodes.NO_CONTENT).json(queryResult);
    }

    const result = queryResult.map((row) => {
      const achievement = (row.currentAmount / row.goalAmount) * 100;

      return {
        title: row.title,
        short_description: row.shortDescription,
        achievement: achievement,
        current_amount: row.currentAmount,
        remaining_day: row.remainingDay,
      };
    });

    return res.status(StatusCodes.OK).json(result);
  } catch (err) {
    console.log(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 문제가 발생했습니다 🥲' });
  }
};

export const getNewFundingList = async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
  const projectRepo = AppDataSource.getRepository(Project);

  const query = projectRepo
    .createQueryBuilder('project')
    .select([
      'project.title AS title',
      'project.shortDescription AS shortDescription',
      'project.goalAmount AS goalAmount',
      'project.currentAmount AS currentAmount',
    ])
    .addSelect('DATEDIFF(project.created_at, NOW()) AS remainingDay');

  if (limit) {
    query.take(limit);
  }

  try {
    const queryResult: ProjectType[] = await query.getRawMany();

    if (queryResult.length === 0) {
      return res.status(StatusCodes.NO_CONTENT).json(queryResult);
    }

    const result = queryResult.map((row) => {
      const achievement = (row.currentAmount / row.goalAmount) * 100;

      return {
        title: row.title,
        short_description: row.shortDescription,
        achievement: achievement,
        current_amount: row.currentAmount,
        remaining_day: row.remainingDay,
      };
    });

    return res.status(StatusCodes.OK).json(result);
  } catch (err) {
    console.log(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 문제가 발생했습니다 🥲' });
  }
};

export const getPopularFundingList = async (req: Request, res: Response) => {
  res.send('get Popular Funding List');
};

export const getFundingListByCategoryId = async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
  const categoryId = req.params.id;
  const projectRepo = AppDataSource.getRepository(Project);

  if (!categoryId) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: '카테고리 ID를 입력해주세요 🥲' });
  }

  const query = projectRepo
    .createQueryBuilder('project')
    .select([
      'project.title AS title',
      'project.shortDescription AS shortDescription',
      'project.goalAmount AS goalAmount',
      'project.currentAmount AS currentAmount',
    ])
    .addSelect('DATEDIFF(project.end_date, NOW()) AS remainingDay')
    .where('project.categoryId = :categoryId', { categoryId: parseInt(categoryId) });

  if (limit) {
    query.take(limit);
  }

  try {
    const queryResult: ProjectType[] = await query.getRawMany();

    if (queryResult.length === 0) {
      return res.status(StatusCodes.NO_CONTENT).json(queryResult);
    }

    const result = queryResult.map((row) => {
      const achievement = (row.currentAmount / row.goalAmount) * 100;

      return {
        title: row.title,
        short_description: row.shortDescription,
        achievement: achievement,
        current_amount: row.currentAmount,
        remaining_day: row.remainingDay,
      };
    });

    return res.status(StatusCodes.OK).json(result);
  } catch (err) {
    console.log(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 문제가 발생했습니다 🥲' });
  }
};

export const getMyFundingList = (req: Request, res: Response) => {
  res.send('My uploaded funding list');
};

export const getRecentFinishedFundingById = (req: Request, res: Response) => {
  res.send('Recently completed funding');
};
