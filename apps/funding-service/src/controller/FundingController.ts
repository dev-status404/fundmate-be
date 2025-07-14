import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Project, OptionData } from '@shared/entities';
import { HttpStatusCode } from 'axios';
import { requestBodyValidation } from '../modules/RequestBodyValidation';

// 프로젝트 생성
export const createFunding = async (req: Request, res: Response) => {
  const { userId } = res.locals.userId;

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
    userId,
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
      user: { userId: userId },
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

    if (fundingResult && optionResult.affected && optionResult.affected === optionIds.length) {
      await queryRunner.commitTransaction();
      return res.status(HttpStatusCode.Created).json({ message: '프로젝트 생성이 완료되었습니다.' });
    } else {
      throw new Error('프로젝트 생성에 실패했습니다.');
    }
  } catch (err) {
    console.error(err);
    await queryRunner.rollbackTransaction();
    return res.status(HttpStatusCode.InternalServerError).json({ message: '서버 문제가 발생했습니다.' });
  } finally {
    await queryRunner.release();
  }
};

// 프로젝트 상세 조회
export const getFundingDetail = async (req: Request, res: Response) => {
  const projectDetailId = req.params.id;

  if (!projectDetailId) {
    return res.status(HttpStatusCode.BadRequest).json({ message: '잘못된 프로젝트 ID 값입니다.' });
  }

  // [TODO] 프로젝트 좋아요 수 출력
  const projectRepo = AppDataSource.getRepository(Project);
  const optionRepo = AppDataSource.getRepository(OptionData);

  const projectQuery = projectRepo
    .createQueryBuilder('project')
    .leftJoin('project.user', 'user')
    .select([
      'project.image_id AS project_image_id',
      'project.title AS title',
      'project.current_amount AS current_price',
      'DATEDIFF(project.end_date, NOW()) AS remaining_day',
      'project.goalAmount AS goal_amount',
      'DATE(CONVERT_TZ(project.start_date, "+00:00", "+09:00")) AS start_date',
      'DATE(CONVERT_TZ(project.end_date, "+00:00", "+09:00")) AS end_date',
      'DATE(CONVERT_TZ(project.delivery_date, "+00:00", "+09:00")) AS delivery_date',
      'project.description AS description',

      'user.image_id AS user_image_id',
      'user.nickname AS nickname',
      'user.contents AS content',
    ])
    .where('project.projectId = :projectId', { projectId: projectDetailId });

  const optionQuery = optionRepo
    .createQueryBuilder('option')
    .select(['option.title AS title', 'option.description AS description', 'option.price AS price'])
    .where('option.project_id = :projectId', { projectId: projectDetailId });

  try {
    const [projectQueryResult, optionQueryResult] = await Promise.all([
      projectQuery.getRawOne(),
      optionQuery.getRawMany(),
    ]);

    if (projectQueryResult && optionQueryResult) {
      const project = {
        image_id: projectQueryResult.project_image_id,
        title: projectQueryResult.title,
        current_price: projectQueryResult.current_price,
        remaining_day: projectQueryResult.remaining_day,
        goal_amount: projectQueryResult.goal_amount,
        start_date: projectQueryResult.start_date,
        end_date: projectQueryResult.end_date,
        delivery_date: projectQueryResult.delivery_date,
        description: projectQueryResult.description,
      };

      const users = {
        image_id: projectQueryResult.user_image_id,
        nickname: projectQueryResult.nickname,
        content: projectQueryResult.content,
      };

      const options = optionQueryResult.map((option) => ({
        title: option.title,
        description: option.description,
        price: option.price,
      }));

      return res.status(HttpStatusCode.Ok).json({ project, users, options });
    } else {
      return res.status(HttpStatusCode.NotFound).json({ message: '프로젝트 정보를 찾을 수 없습니다.' });
    }
  } catch (err) {
    console.error(err);
    return res.status(HttpStatusCode.InternalServerError).json({ message: '서버 문제가 발생했습니다.' });
  }
};
