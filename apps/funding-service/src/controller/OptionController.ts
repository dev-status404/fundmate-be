import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { HttpStatusCode } from 'axios';

type OptionType = {
  title: string;
  description: string;
  price: number;
};

export const createOption = async (req: Request, res: Response) => {
  // [todo] 로그인 확인용 로직 추가

  const { title, description, price }: OptionType = req.body;

  if (!title || !description || !price) {
    return res.status(HttpStatusCode.BadRequest).json({ message: '올바른 정보를 입력하세요.' });
  }

  const optionRepo = AppDataSource.getRepository('option');

  res.send('create option');
};
