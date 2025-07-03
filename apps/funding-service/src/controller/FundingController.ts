import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Project } from '@shared/entities';
import { StatusCodes } from 'http-status-codes';

type ProjectDetailType = {
  title: string;
  shortDescription: string;
  goalAmount: number;
  currentAmount: number;
};

export const createFunding = (req: Request, res: Response) => {
  res.send('funding create');
};

export const getFundingDetail = async (req: Request, res: Response) => {
  res.send('funding detail');
};
