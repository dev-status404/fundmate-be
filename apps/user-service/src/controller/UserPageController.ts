import { Request, Response } from 'express';
// import { AppDataSource } from '../data-source';
import dotenv from 'dotenv';
// import StatusCode from 'http-status-codes';
dotenv.config();

export const getMakerProfile = (req: Request, res: Response) => {
  return res.json('메이커 프로필 조회');
};

export const getSupporterProfile = (req: Request, res: Response) => {
  return res.json('서포터 프로필 조회');
};
