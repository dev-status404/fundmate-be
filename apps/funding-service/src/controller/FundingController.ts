import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Project, OptionData } from '@shared/entities';
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
  // [TODO] imageId 받아오기 -> funding Create
  const getToken = ensureAuthorization(req);

  if (getToken instanceof Error) {
    return jwtErrorHandler(getToken, res);
  }

  const user = getToken.userId;

  const {
    image_id: imageId,
    title,
    goal_amount: goalAmount,
    start_date: startDate,
    end_date: endDate,
    delivery_date: deliveryDate,
    short_description: shortDescription,
    description,
    category_id: category,
    option_ids: optionIds,
    gender,
    age_group: ageGroup,
  } = req.body;

  const values = [
    imageId,
    user,
    category,
    title,
    goalAmount,
    startDate,
    endDate,
    deliveryDate,
    shortDescription,
    description,
    optionIds,
    gender,
    ageGroup,
  ];

  if (!requestBodyValidation(values)) {
    return res.status(HttpStatusCode.BadRequest).json({ message: '올바른 정보를 입력하세요.' });
  }

  const queryRunner = AppDataSource.createQueryRunner();
  const optionRepo = queryRunner.manager.getRepository(OptionData);
  const fundingRepo = queryRunner.manager.getRepository(Project);

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const newFunding = fundingRepo.create({
      image: { imageId },
      user: { userId: user },
      category: { categoryId: category },
      goalAmount,
      currentAmount: 0,
      title,
      startDate,
      endDate,
      deliveryDate,
      shortDescription,
      description,
      isActive: new Date(startDate) <= new Date() ? true : false,
      gender,
      ageGroup,
    });

    const fundingResult = await fundingRepo.save(newFunding);

    const optionResult = await optionRepo
      .createQueryBuilder()
      .update()
      .set({ project: { projectId: fundingResult.projectId } })
      .where('option_id IN (:...optionIds)', { optionIds })
      .execute();

    if (fundingResult && optionResult.affected && optionResult.affected > 0) {
      return res.status(HttpStatusCode.Created).json({ message: '프로젝트 생성이 완료되었습니다.' });
    } else {
      throw new Error('프로젝트 생성에 실패했습니다.');
    }
  } catch (err) {
    console.log(err);
    await queryRunner.rollbackTransaction();
    return res.status(HttpStatusCode.InternalServerError).json({ message: '서버 문제가 발생했습니다.' });
  } finally {
    await queryRunner.release();
  }
};

export const getFundingDetail = async (req: Request, res: Response) => {
  res.send('funding detail');
};
