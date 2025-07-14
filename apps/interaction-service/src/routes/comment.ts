import express from 'express';
import { addComment, removeComment, commentList } from '../controller/CommentController';

const router = express.Router();

// JSON body 파싱
router.use(express.json());

// 후기 등록
router.post('/:id', addComment);

// 후기 삭제
router.delete('/:id', removeComment);

// 후기 목록 조회
router.get('/:id', commentList);

export default router;
