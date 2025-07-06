import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { HttpStatusCode } from 'axios';
import { OptionData } from 'shared/entities/src';

type OptionType = {
  title: string;
  description: string;
  price: number;
};

// [WIP] 테스트 중인 API입니다.
export const createOption = async (req: Request, res: Response) => {
  // [todo] 로그인 확인용 로직 추가

  const { title, description, price }: OptionType = req.body;

if (!title || !description || price == null) {
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
    console.log(err);
    return res.status(HttpStatusCode.InternalServerError).json({ message: '서버 문제가 발생했습니다.' });
  }
};
