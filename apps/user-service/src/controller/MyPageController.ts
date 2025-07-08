import { Request, Response } from 'express';
// import { AppDataSource } from '../data-source';
import dotenv from 'dotenv';
// import StatusCode from 'http-status-codes';
dotenv.config();

export const deleteUser = (req: Request, res: Response) => {
  return res.json('회원 탈퇴');
};

export const getMyPage = (req: Request, res: Response) => {
  return res.json('마이 페이지 내 정보 조회');
};

export const UpdateMyPage = (req: Request, res: Response) => {
  return res.json('마이 페이지 내 정보 수정');
};

export const getMySupportedProjects = (req: Request, res: Response) => {
  return res.json('마이 페이지 후원한 프로젝트 조회');
};

export const getMyComments = (req: Request, res: Response) => {
  return res.json('마이 페이지 내 후기 조회');
};

export const getMyCreatedProjects = (req: Request, res: Response) => {
  return res.json('마이 페이지 내 펀딩 프로젝트 목록 조회');
};

export const getMyProjectStatistics = (req: Request, res: Response) => {
  return res.json('마이 페이지 통계 조회');
};

export const getMyProjectPayments = (req: Request, res: Response) => {
  return res.json('마이 페이지 내 결제 조회');
};
