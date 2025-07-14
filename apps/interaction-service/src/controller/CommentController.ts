import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { ensureAuthorization } from '../modules/ensureAuthorization';
import { Comment, User, Project } from '@shared/entities';

export const addComment = async (req: Request, res: Response): Promise<Response | void> => {
  const projectId = Number(req.params.id);
  const { contents } = req.body;

  const authorization = ensureAuthorization(req);
  if (authorization instanceof Error) {
    if (authorization instanceof TokenExpiredError) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: '로그인 세션이 만료되었습니다. 다시 로그인하세요.' });
    } else if (authorization instanceof JsonWebTokenError) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: '잘못된 토큰입니다.' });
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: '인증되지 않은 사용자입니다.' });
    }
  }

  try {
    const userRepo = AppDataSource.getRepository(User);
    const projectRepo = AppDataSource.getRepository(Project);
    const commentRepo = AppDataSource.getRepository(Comment);

    const user = await userRepo.findOneBy({ userId: authorization.userId });
    const project = await projectRepo.findOneBy({ projectId: projectId });

    if (!user || !project) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: '유저 또는 프로젝트를 찾을 수 없습니다.' });
    }

    const comment = commentRepo.create({
      userId: user,
      project: project,
      content: contents,
    });

    const savedComment = await commentRepo.save(comment);
    return res.status(StatusCodes.CREATED).json(savedComment);
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '댓글 추가에 실패했습니다.' });
  }
};

export const removeComment = async (req: Request, res: Response): Promise<Response | void> => {
  const commentId = Number(req.params.id);
  const authorization = ensureAuthorization(req);

  if (authorization instanceof Error) {
    if (authorization instanceof TokenExpiredError) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: '로그인 세션이 만료되었습니다. 다시 로그인하세요.' });
    } else if (authorization instanceof JsonWebTokenError) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: '잘못된 토큰입니다.' });
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: '인증되지 않은 사용자입니다.' });
    }
  }

  try {
    const commentRepo = AppDataSource.getRepository(Comment);
    const comment = await commentRepo.findOne({
      where: { commentId },
      relations: ['userId'],
    });

    if (!comment || comment.userId.userId !== authorization.userId) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: '댓글 삭제 권한이 없습니다.' });
    }

    await commentRepo.remove(comment);
    return res.status(StatusCodes.OK).json({ message: '댓글이 삭제되었습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '댓글 삭제에 실패했습니다.' });
  }
};

export const commentList = async (req: Request, res: Response): Promise<Response | void> => {
  const projectId = Number(req.params.id);

  try {
    const commentRepo = AppDataSource.getRepository(Comment);
    const comments = await commentRepo.find({
      where: { project: { projectId } },
      relations: ['userId'],
      order: { createdAt: 'DESC' },
    });

    const response = comments.map((c) => ({
      commentId: c.commentId,
      userId: c.userId.userId,
      nickname: c.userId.nickname,
      imgId: c.userId.image,
      content: c.content,
      createdAt: c.createdAt,
    }));

    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '댓글 목록 조회에 실패했습니다.' });
  }
};
