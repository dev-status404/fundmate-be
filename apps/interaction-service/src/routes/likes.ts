import express from 'express';
import { addLike, removeLike, myLikeList } from '../controller/LikeController';

const router = express.Router();

router.use(express.json());
router.post('/:id', addLike);
router.delete('/:id', removeLike);
router.get('/', myLikeList);

export default router;
