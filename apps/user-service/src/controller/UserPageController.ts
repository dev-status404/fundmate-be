import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import StatusCode from 'http-status-codes';
import { Follow, User } from '@shared/entities';
import { serviceClients } from '@shared/config';

export const getMakerProfile = async (req: Request, res: Response) => {
  const makerId = Number(req.params.user_id);
  const userRepo = AppDataSource.getRepository(User);
  const followRepo = AppDataSource.getRepository(Follow);

  try {
    const user = await userRepo.findOne({
      where: { userId: makerId },
      relations: ['image'],
    });

    if (!user) {
      return res.status(StatusCode.NOT_FOUND).json({ message: '존재하지 않는 유저' });
    }

    const followingCount = await followRepo.count({ where: { followerId: makerId } });
    const followerCount = await followRepo.count({ where: { followingId: makerId } });

    const fundingClient = serviceClients['funding-service'];
    const fundingList = await fundingClient.get(`/profiles/${makerId}`);

    return res.status(StatusCode.OK).json({
      imageId: user.image?.imageId ?? null,
      imageUrl: user.image?.url ?? null,
      nickname: user.nickname,
      contents: user.contents,
      followingCount,
      followerCount,
      fundingList: fundingList.data,
      fundingCount: fundingList.data.length ?? 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: '메이커 프로필 조회 실패' });
  }
};

export const getSupporterProfile = async (req: Request, res: Response) => {
  const supporterId = Number(req.params.user_id);
  const userRepo = AppDataSource.getRepository(User);
  const followRepo = AppDataSource.getRepository(Follow);
  const userId = supporterId;

  try {
    const user = await userRepo.findOne({
      where: { userId: supporterId },
      relations: ['image'],
    });

    if (!user) {
      return res.status(StatusCode.NOT_FOUND).json({ message: '존재하지 않는 유저' });
    }

    const followingCount = await followRepo.count({ where: { followerId: supporterId } });
    const followerCount = await followRepo.count({ where: { followingId: supporterId } });

    const paymentClient = serviceClients['payment-service'];
    paymentClient.setAuthContext({ userId });
    const paymentList = await paymentClient.get(`/api/reservation/count`);

    return res.status(StatusCode.OK).json({
      imageId: user.image?.imageId ?? null,
      imageUrl: user.image?.url ?? null,
      nickname: user.nickname,
      contents: user.contents,
      followingCount,
      followerCount,
      paymentCount: paymentList.data.count ?? 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: '서포터 프로필 조회 실패' });
  }
};
