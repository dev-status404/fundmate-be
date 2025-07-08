import { Request, Response } from 'express';
// import { AppDataSource } from '../data-source';
import dotenv from 'dotenv';
// import StatusCode from 'http-status-codes';
dotenv.config();

export const addFollow = (req: Request, res: Response) => {
  return res.json('팔로잉 추가');
};

export const deleteFollow = (req: Request, res: Response) => {
  return res.json('팔로잉 삭제');
};

export const getMyFollowing = (req: Request, res: Response) => {
  return res.json('팔로잉 조회');
};

export const getMyFollower = (req: Request, res: Response) => {
  return res.json('팔로워 조회');
};
