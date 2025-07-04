import { Request, Response } from 'express';
// import { AppDataSource } from '../data-source';

// type OptionType = {
//   title: string;
//   description: string;
//   price: number;
// };

export const createOption = (req: Request, res: Response) => {
  // const optionRepo = AppDataSource.getRepository('option');
  res.send('create option');
};

export const deleteOption = (req: Request, res: Response) => {
  res.send('delete option');
};
