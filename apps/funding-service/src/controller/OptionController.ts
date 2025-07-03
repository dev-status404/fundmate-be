import { Request, Response } from 'express';

export const createOption = (req: Request, res: Response) => {
  res.send('create option');
};

export const deleteOption = (req: Request, res: Response) => {
  res.send('delete option');
};
