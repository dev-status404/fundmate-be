import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({ message: '결제 서버 api작성 공간' });
});

export default router;
