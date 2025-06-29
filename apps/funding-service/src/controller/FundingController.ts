import { Request, Response } from 'express';

export const createFunding = (req: Request, res: Response) => {
  res.send('funding create');
};

export const getFundingDetail = (req: Request, res: Response) => {
  res.send('get Funding Detail');
};


