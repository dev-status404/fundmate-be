import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

const router = Router();

router.get('/', (req, res) => {
  return res.status(StatusCodes.OK).json({ message: '펀딩 결제 및 예약 내역 전체 조회' });
});
router.get('/:id', (req, res) => {
  return res.status(StatusCodes.OK).json({ message: '펀딩 결제 및 예약 내역 상세 조회' });
});
router.post('/:id', (req, res) => {
  return res.status(StatusCodes.OK).json({ message: '펀딩 결제 및 예약 등록' });
});
router.get('/count', (req, res) => {
  return res.status(StatusCodes.OK).json({ message: '펀딩 전체 갯수' });
});
router.patch('/:id', (req, res) => {
  return res.status(StatusCodes.OK).json({ message: '펀딩 결제 및 예약 정보 수정' });
});
router.delete('/:id', (req, res) => {
  return res.status(StatusCodes.OK).json({ message: '펀딩 결제 예약 취소' });
});

export default router;
