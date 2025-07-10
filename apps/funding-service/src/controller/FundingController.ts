import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '@shared/entities';
import { HttpStatusCode } from 'axios';
import { requestBodyValidation } from '../modules/RequestBodyValidation';
import { ensureAuthorization } from '../modules/ensureAuthorization';
import { jwtErrorHandler } from '../modules/jwtErrorHandler';

// type ProjectDetailType = {
//   title: string;
//   shortDescription: string;
//   goalAmount: number;
//   currentAmount: number;
// };

export const createFunding = async (req: Request, res: Response) => {
  // [TODO] userId validation, imageId 받아오기 -> funding Create
  const getToken = ensureAuthorization(req);

  if (getToken instanceof Error) {
    return jwtErrorHandler(getToken, res);
  }

  const user = getToken.userId;
  const checkUser = await AppDataSource.getRepository(User).findOne({ where: { userId: user } });
  if (!checkUser) {
    return res.status(HttpStatusCode.Unauthorized).json({ message: '로그인이 필요합니다. - 잘못된 로그인' });
  }
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
    return res.status(HttpStatusCode.BadRequest).json({ message: '올바른 정보를 입력하세요.' });
  }

  // const optionRepo = AppDataSource.getRepository(OptionData);
  // const fundingRepo = AppDataSource.getRepository(Project);

  try {
    // fundingRepo.create({
    //   title,
    //   goalAmount,
    //   startDate,
    //   endDate,
    //   deliveryDate,
    //   description,
    //   user,
    //   category,
    //   story,
    //   gender,
    //   ageGroup,
    // });

    return res.status(HttpStatusCode.Created).json({ message: '프로젝트 생성이 완료되었습니다.' });
  } catch (err) {
    console.log(err);
    return res.status(HttpStatusCode.InternalServerError).json({ message: '서버 문제가 발생했습니다.' });
  }

  res.send('funding create');
};

export const getFundingDetail = async (req: Request, res: Response) => {
  res.send('funding detail');
};
