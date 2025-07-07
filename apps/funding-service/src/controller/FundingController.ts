import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { OptionData, Project } from '@shared/entities';
import { StatusCodes } from 'http-status-codes';
import { requestBodyValidation } from '../modules/RequestBodyValidation';

type ProjectDetailType = {
  title: string;
  shortDescription: string;
  goalAmount: number;
  currentAmount: number;
};

export const createFunding = (req: Request, res: Response) => {
  // [TODO] 토큰 값 받아오기 -> userId validation, imageId 받아오기 -> funding Create

  const {
    title,
    goal_amount: goalAmount,
    start_date: startDate,
    end_date: endDate,
    delivery_date: deliveryDate,
    description,
    category_id: category,
    story,
    option_ids: optionIds,
    gender,
    age_group: ageGroup,
  } = req.body;

  const values = [
    title,
    goalAmount,
    startDate,
    endDate,
    deliveryDate,
    description,
    category,
    story,
    optionIds,
    gender,
    ageGroup,
  ];

  if (!requestBodyValidation(values)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: '올바른 정보를 입력하세요.' });
  }

  const optionRepo = AppDataSource.getRepository(OptionData);
  const fundingRepo = AppDataSource.getRepository(Project);

  try {
    // fundingRepo.create({
    //   title,
    //   goalAmount,
    //   startDate,
    //   endDate,
    //   deliveryDate,
    //   description,
    //   category,
    //   story,
    //   gender,
    //   ageGroup,
    // });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 문제가 발생했습니다.' });
  }

  res.send('funding create');
};

export const getFundingDetail = async (req: Request, res: Response) => {
  res.send('funding detail');
};
