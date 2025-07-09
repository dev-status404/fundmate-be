import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

const router = Router();

router.post('/', (req, res) => {
  return res.status(StatusCodes.OK).json({ message: '결제 수단 등록' });
});
router.patch('/:id', (req, res) => {
  return res.status(StatusCodes.OK).json({ message: '결제 기본 수단 변경' });
});
router.delete('/:id', (req, res) => {
  return res.status(StatusCodes.OK).json({ message: '결제 수단 삭제' });
});
router.get('/', (req, res) => {
  return res.status(StatusCodes.OK).json({ message: '결제 수단 상세 조회' });
});
router.get('/:id', (req, res) => {
  return res.status(StatusCodes.OK).json({ message: '결제 수단 상세 조회' });
});

export default router;
