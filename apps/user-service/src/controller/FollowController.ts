import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '@shared/entities';
import { Follow } from '@shared/entities';
import StatusCode from 'http-status-codes';

export const addFollow = async (req: Request, res: Response) => {
  const userRepo = AppDataSource.getRepository(User);
  const followRepo = AppDataSource.getRepository(Follow);

  const followerId = res.locals.user.userId;
  const followingId = req.body.following_id;

  if (!followingId) {
    return res.status(StatusCode.BAD_REQUEST).json({ message: '팔로우할 유저 ID 필요' });
  }

  if (followerId === followingId) {
    return res.status(StatusCode.BAD_REQUEST).json({ message: '자기 자신 팔로우 불가' });
  }

  try {
    const followingUser = await userRepo.findOneBy({ userId: followingId });
    if (!followingUser) {
      return res.status(StatusCode.NOT_FOUND).json({ message: '존재하지 않는 유저' });
    }

    const alreadyFollowed = await followRepo.findOneBy({
      followerId,
      followingId,
    });

    if (alreadyFollowed) {
      return res.status(StatusCode.CONFLICT).json({ message: '이미 팔로우한 유저' });
    }

    const follow = followRepo.create({ followerId, followingId });
    await followRepo.save(follow);

    return res.status(StatusCode.CREATED).json({ message: '팔로우 성공' });
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: '팔로우 실패' });
  }
};

export const deleteFollow = async (req: Request, res: Response) => {
  const userRepo = AppDataSource.getRepository(User);
  const followRepo = AppDataSource.getRepository(Follow);

  const followerId = res.locals.user.userId;
  const followingId = req.body.following_id;

  if (!followingId) {
    return res.status(StatusCode.BAD_REQUEST).json({ message: '팔로우 취소할 유저 ID 필요' });
  }

  if (followerId === followingId) {
    return res.status(StatusCode.BAD_REQUEST).json({ message: '자기 자신 언팔로우 불가' });
  }

  try {
    const followingUser = await userRepo.findOneBy({ userId: followingId });
    if (!followingUser) {
      return res.status(StatusCode.NOT_FOUND).json({ message: '존재하지 않는 유저' });
    }

    const follow = await followRepo.findOneBy({ followerId, followingId });
    if (!follow) {
      return res.status(StatusCode.NOT_FOUND).json({ message: '팔로우하지 않은 유저' });
    }

    await followRepo.delete(follow);

    return res.status(StatusCode.OK).json({ message: '팔로우 취소 성공' });
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: '팔로우 취소 실패' });
  }
};

export const getMyFollowing = async (req: Request, res: Response) => {
  const followRepo = AppDataSource.getRepository(Follow);

  const followerId = res.locals.user.userId;

  try {
    const followingCount = await followRepo.count({
      where: { followerId },
    });

    const followingList = await followRepo.find({
      where: { followerId },
      relations: ['following', 'following.image'],
    });

    const result = followingList.map((follow) => {
      return {
        userId: follow.following.userId,
        nickname: follow.following.nickname,
        imageId: follow.following.image?.imageId ?? null,
        imageUrl: follow.following.image?.url ?? null,
      };
    });

    return res.status(StatusCode.OK).json({
      total: followingCount,
      following: result,
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: '팔로잉 목록 조회 실패' });
  }
};

export const getMyFollower = async (req: Request, res: Response) => {
  const followRepo = AppDataSource.getRepository(Follow);

  const followingId = res.locals.user.userId;

  try {
    const followerCount = await followRepo.count({
      where: { followingId },
    });

    const followerList = await followRepo.find({
      where: { followingId },
      relations: ['follower', 'follower.image'],
    });

    const result = followerList.map((follow) => {
      return {
        userId: follow.follower.userId,
        nickname: follow.follower.nickname,
        imageId: follow.follower.image?.imageId ?? null,
        imageUrl: follow.follower.image?.url ?? null,
      };
    });

    return res.status(StatusCode.OK).json({
      total: followerCount,
      follower: result,
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: '팔로워 목록 조회 실패' });
  }
};
