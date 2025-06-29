import { Request, Response } from 'express';

export const getAllProjects = (req: Request, res: Response) => {
  res.send('main api');
};

export const getMyFundingList = (req: Request, res: Response) => {
  res.send('My uploaded funding list');
};

export const getRecentFinishedFundingById = (req: Request, res: Response) => {
  res.send('Recently completed funding');
};
