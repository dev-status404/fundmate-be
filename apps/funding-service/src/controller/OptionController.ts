import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { HttpStatusCode } from 'axios';
import { OptionData } from '@shared/entities';
import { requestBodyValidation } from '../modules/RequestBodyValidation';

type OptionType = {
  title: string;
  description: string;
  price: number;
};

export const createOption = async (req: Request, res: Response) => {
  const { title, description, price }: OptionType = req.body;

  const values = [title, description, price];

  if (!requestBodyValidation(values)) {
    return res.status(HttpStatusCode.BadRequest).json({ message: '올바른 정보를 입력하세요.' });
  }

  try {
    const optionRepo = AppDataSource.getRepository(OptionData);

    const newOptions = optionRepo.create({
      title,
      description,
      price,
    });

    const savedOptions = await optionRepo.save(newOptions);
    const optionId = savedOptions.optionId;

    console.log(optionId);

    if (!optionId) throw new Error('옵션 ID가 없습니다.');

    return res.status(HttpStatusCode.Created).json({ option_id: optionId });
  } catch (err) {
    console.error(err);
    return res.status(HttpStatusCode.InternalServerError).json({ message: '서버 문제가 발생했습니다.' });
  }
};
