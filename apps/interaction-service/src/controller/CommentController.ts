import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
//import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
//import { ensureAuthorization } from '../modules/ensureAuthorization';
import { Comment, User, Project } from '@shared/entities';

export const addComment = async (req: Request, res: Response): Promise<Response | void> => {
  const projectId = Number(req.params.id);
  const { contents } = req.body;

  const { userId } = res.locals.user;

  try {
    const userRepo = AppDataSource.getRepository(User);
    const projectRepo = AppDataSource.getRepository(Project);
    const commentRepo = AppDataSource.getRepository(Comment);

    const user = await userRepo.findOneBy({ userId: userId });
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
  const { userId } = res.locals.user;

  try {
    const commentRepo = AppDataSource.getRepository(Comment);
    const comment = await commentRepo.findOne({
      where: { commentId },
      relations: ['userId'],
    });

    if (!comment || comment.userId.userId !== userId) {
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
