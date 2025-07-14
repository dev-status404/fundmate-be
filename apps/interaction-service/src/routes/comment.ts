import express from 'express';
import { addComment, removeComment, commentList } from '../controller/CommentController';

const router = express.Router();

router.use(express.json());
router.post('/:id', addComment);
router.delete('/:id', removeComment);
router.get('/:id', commentList);

export default router;
