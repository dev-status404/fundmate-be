import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Age, Category, Follow, Image, InterestCategory, User } from '@shared/entities';
import { Token } from '@shared/entities';
import StatusCode from 'http-status-codes';
import { serviceClients } from '@shared/config';

export const deleteUser = async (req: Request, res: Response) => {
  const userRepo = AppDataSource.getRepository(User);
  const tokenRepo = AppDataSource.getRepository(Token);

  const { userId } = res.locals.user;
  const refreshToken = req.header('x-refresh-token');

  if (!refreshToken) {
    return res.status(StatusCode.UNAUTHORIZED).json({ message: '리프레시 토큰 필요' });
  }

  try {
    const tokenRecord = await tokenRepo.findOne({
      where: {
        user: { userId: userId },
        refreshToken,
        revoke: false,
      },
      relations: ['user'],
    });

    if (tokenRecord) {
      tokenRecord.revoke = true;
      await tokenRepo.save(tokenRecord);
    }

    await userRepo.delete({ userId: userId });

    res.clearCookie('accessToken', {
      httpOnly: false,
      secure: false,
      sameSite: 'none',
    });
    res.clearCookie('refreshToken', {
      httpOnly: false,
      secure: false,
      sameSite: 'none',
    });

    return res.status(StatusCode.OK).json({ message: '회원 탈퇴 성공' });
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: '회원 탈퇴 실패' });
  }
};

export const getMyPage = async (req: Request, res: Response) => {
  const followRepo = AppDataSource.getRepository(Follow);

  const { userId } = res.locals.user;
  let projectIds = req.query.project_id;

  if (typeof projectIds === 'string') {
    projectIds = [projectIds];
  }

  try {
    const followingCount = await followRepo.count({ where: { followerId: userId } });
    const followerCount = await followRepo.count({ where: { followingId: userId } });

    const fundingClient = serviceClients['funding-service'];
    fundingClient.setAuthContext({ userId });
    const fundingList = await fundingClient.get(`/api/projects/recent?project_id=${projectIds}`);

    const paymentClient = serviceClients['payment-service'];
    paymentClient.setAuthContext({ userId });
    const paymentList = await paymentClient.get(`/reservations/count`);

    const interactionClient = serviceClients['interaction-service'];
    interactionClient.setAuthContext({ userId });
    const interactionList = await interactionClient.get(`/interactionmain`);

    return res.status(StatusCode.OK).json({
      followingCount,
      followerCount,
      paymentCount: paymentList.data.count ?? 0,
      likeCount: interactionList.data.likeCount ?? 0,
      commentCount: interactionList.data.commentCount ?? 0,
      fundingGetList: fundingList.data,
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: '마이 페이지 조회 실패' });
  }
};

export const getMyProfile = async (req: Request, res: Response) => {
  const userRepo = AppDataSource.getRepository(User);
  const interestCategoryRepo = AppDataSource.getRepository(InterestCategory);
  const { userId } = res.locals.user;

  try {
    const user = await userRepo.findOne({
      where: { userId },
      relations: ['age', 'image'],
    });

    if (!user) {
      return res.status(StatusCode.NOT_FOUND).json({ message: '존재하지 않는 유저' });
    }

    const interestCategory = await interestCategoryRepo.findOne({
      where: { user: { userId } },
      relations: ['category'],
    });

    const userProfile = {
      userId: user.userId,
      nickname: user.nickname,
      gender: user.gender,
      ageId: user.age?.ageId ?? null,
      generation: user.age?.generation ?? null,
      email: user.email,
      contents: user.contents,
      imageId: user.image?.imageId ?? null,
      imageUrl: user.image?.url ?? null,
      interestCategory: interestCategory?.interestCategoryId ?? null,
      categoryName: interestCategory?.category.name ?? null,
    };

    return res.status(StatusCode.OK).json(userProfile);
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: '내 프로필 조회 실패' });
  }
};

export const UpdateMyProfile = async (req: Request, res: Response) => {
  const userRepo = AppDataSource.getRepository(User);
  const imageRepo = AppDataSource.getRepository(Image);
  const ageRepo = AppDataSource.getRepository(Age);
  const interestCategoryRepo = AppDataSource.getRepository(InterestCategory);
  const categoryRepo = AppDataSource.getRepository(Category);

  const { userId } = res.locals.user;

  const { image_url, nickname, gender, age_id, contents, category_id } = req.body;
  const imageUrl = image_url;
  const ageId = age_id;
  const categoryId = category_id;

  try {
    const user = await userRepo.findOne({
      where: { userId },
      relations: ['image', 'age'],
    });

    if (!user) {
      return res.status(StatusCode.NOT_FOUND).json({ message: '존재하지 않는 유저' });
    }

    if (imageUrl === null) {
      user.image = null;
    } else if (typeof imageUrl === 'string') {
      let image = await imageRepo.findOne({ where: { url: imageUrl } });

      if (!image) {
        image = imageRepo.create({ url: imageUrl });
        await imageRepo.save(image);
      }

      user.image = image;
    }

    user.nickname = nickname;
    user.gender = gender;
    user.contents = contents;

    const age = await ageRepo.findOne({ where: { ageId } });
    if (!age) return res.status(StatusCode.BAD_REQUEST).json({ message: '연령 정보 없음' });
    user.age = age;

    await userRepo.save(user);

    const category = await categoryRepo.findOne({ where: { categoryId } });
    if (!category) return res.status(StatusCode.BAD_REQUEST).json({ message: '카테고리 정보 없음' });

    const interestCategory = await interestCategoryRepo.findOne({ where: { user: { userId } } });
    if (interestCategory) {
      interestCategory.category = category;
      await interestCategoryRepo.save(interestCategory);
    }

    return res.status(StatusCode.OK).json({ message: '내 프로필 수정 완료' });
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: '내 프로필 수정 실패' });
  }
};

export const getMySupportedProjects = async (req: Request, res: Response) => {
  const { userId } = res.locals.user;

  try {
    const paymentClient = serviceClients['payment-service'];
    paymentClient.setAuthContext({ userId });
    const paymentList = await paymentClient.get(`/reservations`);

    return res.status(StatusCode.OK).json(paymentList.data);
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: '마이 페이지 후원한 프로젝트 조회 실패' });
  }
};

export const getMyComments = async (req: Request, res: Response) => {
  const { userId } = res.locals.user;

  try {
    const fundingClient = serviceClients['funding-service'];
    fundingClient.setAuthContext({ userId });
    const CommentsList = await fundingClient.get(`/profiles/my-comments`);

    return res.status(StatusCode.OK).json(CommentsList.data);
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: '마이 페이지 후기 내역 조회 실패' });
  }
};

export const getMyCreatedProjects = async (req: Request, res: Response) => {
  const { userId } = res.locals.user;

  try {
    const fundingClient = serviceClients['funding-service'];
    fundingClient.setAuthContext({ userId });
    const completedFundingList = await fundingClient.get(`/profiles/recent-completed`);
    const fundingList = await fundingClient.get(`/profiles/my-projects`);

    return res.status(StatusCode.OK).json({
      completedFunding: completedFundingList.data,
      fundingList: fundingList.data,
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: '마이 페이지 펀딩 내역 조회 실패' });
  }
};

export const getMyProjectStatistics = async (req: Request, res: Response) => {
  const { userId } = res.locals.user;
  const makerId = userId;
  const startDate = req.query.start;
  const endDate = req.query.end;

  try {
    const fundingClient = serviceClients['funding-service'];
    const fundingList = await fundingClient.get(`/profiles/${makerId}`);

    const paymentClient = serviceClients['payment-service'];
    paymentClient.setAuthContext({ userId });
    const paymentList = await paymentClient.get(`/statistics?start=${startDate}&end=${endDate}`);

    return res.status(StatusCode.OK).json({
      fundingCount: fundingList.data.length,
      statistic: paymentList.data,
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: '마이 페이지 통계 관리 조회 실패' });
  }
};

export const getMyProjectPayments = async (req: Request, res: Response) => {
  const { userId } = res.locals.user;

  try {
    const paymentClient = serviceClients['payment-service'];
    paymentClient.setAuthContext({ userId });
    const paymentList = await paymentClient.get(`/reservations/history`);

    return res.status(StatusCode.OK).json(paymentList.data);
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: '마이 페이지 결제 관리 조회 실패' });
  }
};
