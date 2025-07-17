import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Project, OptionData } from '@shared/entities';
import { HttpStatusCode } from 'axios';
import { requestBodyValidation } from '../modules/RequestBodyValidation';

// 프로젝트 생성
export const createFundingAndOption = async (req: Request, res: Response) => {
  const { userId } = res.locals.user;

  const {
    image_url: imageUrl,
    title,
    goal_amount: goalAmount,
    start_date: startDate,
    end_date: endDate,
    delivery_date: deliveryDate,
    short_description: shortDescription,
    description,
    category_id: category,
    options,
    gender,
    age_group: ageGroup,
  } = req.body;

  const values = [
    imageUrl,
    userId,
    category,
    title,
    goalAmount,
    startDate,
    endDate,
    deliveryDate,
    shortDescription,
    description,
    options,
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
    const newFunding: Project = fundingRepo.create({
      imageUrl: imageUrl,
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

    if(!fundingResult.projectId) {
      throw new Error("프로젝트 생성 실패");
    }

    for (const option of options) {
      const newOption: OptionData = optionRepo.create({
        title: option.title,
        description: option.description,
        price: option.price,
        project: { projectId: fundingResult.projectId },
      });

      const savedOption = await optionRepo.save(newOption);

      if (!savedOption.optionId) {
        throw new Error("옵션 생성 실패");
      }
    }
      
    
    await queryRunner.commitTransaction();
    return res.status(HttpStatusCode.Created).json({project_id: fundingResult.projectId});
    
  } catch (err) {
    console.error(err);
    await queryRunner.rollbackTransaction();
    return res.status(HttpStatusCode.InternalServerError).json({ message: '프로젝트 & 옵션 생성을 실패하였습니다.' });
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
    .leftJoin('project.paymentSchedule', 'schedule')
    .leftJoin('project.likes', 'like')
    .select([
      'project.image_url AS project_image_url',
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

      'DATE_ADD(project.end_date, INTERVAL 1 DAY) AS payment_date',
      'COUNT(schedule.payment_info_id) AS sponsor',
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
        image_url: projectQueryResult.project_image_url,
        title: projectQueryResult.title,
        current_price: projectQueryResult.current_price,
        remaining_day: projectQueryResult.remaining_day,
        goal_amount: projectQueryResult.goal_amount,
        start_date: projectQueryResult.start_date,
        end_date: projectQueryResult.end_date,
        delivery_date: projectQueryResult.delivery_date,
        description: projectQueryResult.description,
        payment_date: projectQueryResult.payment_date,
        sponsor: Number(projectQueryResult.sponsor),
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
