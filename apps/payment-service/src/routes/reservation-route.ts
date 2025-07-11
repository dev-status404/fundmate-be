import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppDataSource } from '../data-source';
import { PaymentHistory, PaymentInfo, PaymentSchedule } from '@shared/entities';
import createError from 'http-errors';

const router = Router();

// 펀딩 전체 갯수
router.get('/count', async (req, res) => {
  const { userId } = res.locals.user;
  if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: '로그인이 필요합니다.' });
  try {
    const paymentScheduleRepo = AppDataSource.getRepository(PaymentSchedule);
    const paymentHistoryRepo = AppDataSource.getRepository(PaymentHistory);

    const countBySchedule = await paymentScheduleRepo.count({ where: { userId } });
    const countByHistory = await paymentHistoryRepo.count({ where: { userId } });

    return res
      .status(StatusCodes.OK)
      .json({ count: countBySchedule + countByHistory, countBySchedule, countByHistory });
  } catch (err: any) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '펀딩 갯수 조회 실패' });
  }
});

// 펀딩 결제 및 예약 내역 전체 조회
router.get('/', async (req, res) => {
  const { userId } = res.locals.user;
  try {
    const paymentScheduleRepo = AppDataSource.getRepository(PaymentSchedule);
    const findBySchedule = await paymentScheduleRepo.findBy({ userId });
    if (findBySchedule.length === 0) throw createError(StatusCodes.NOT_FOUND, '예약된 정보가 없습니다.');
    return res.status(StatusCodes.OK).json(findBySchedule);
  } catch (err: any) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '전체 펀딩 조회 실패' });
  }
});

// 펀딩 결제 및 예약 내역 상세 조회
router.get('/:id', (req, res) => {
  const { userId } = res.locals.user;
  const reservationId = +req.params.id;
  try {
    const paymentScheduleRepo = AppDataSource.getRepository(PaymentSchedule);
    const findBySchedule = paymentScheduleRepo.findOneBy({ id: reservationId, userId });
    if (!findBySchedule) throw createError(StatusCodes.NOT_FOUND, '예약된 정보가 없습니다.');
    return res.status(StatusCodes.OK).json(findBySchedule);
  } catch (err: any) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '펀딩 조회 실패' });
  }
});

// 펀딩 결제 및 예약 등록
router.post('/', (req, res) => {
  return res.status(StatusCodes.OK).json({ message: '펀딩 결제 및 예약 등록' });
});

// 펀딩 결제 및 예약 정보 수정
router.patch('/:id', (req, res) => {
  return res.status(StatusCodes.OK).json({ message: '펀딩 결제 및 예약 정보 수정' });
});

// 결제 정보 수정
router.patch('/:id/payment_methods', async (req, res) => {
  const { userId } = res.locals.user;
  const reservationId = +req.params.id;
  const { method, bank, token, masked, extra } = req.body;
  if (!method || !bank || !token || !masked || !extra) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: '올바른 결제정보를 입력해주세요' });
  }
  try {
    await AppDataSource.transaction(async (manager) => {
      const reservation = await manager.findOneBy(PaymentSchedule, { id: reservationId, userId });
      if (!reservation) throw createError(404, '예약된 정보가 없습니다.');

      const now = new Date();
      const payDate = reservation.scheduleDate;
      const isOneDayAgo = payDate.getTime() - now.getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (isOneDayAgo <= oneDayMs) {
        throw createError(StatusCodes.FORBIDDEN, '결제 예정일 하루 에는 결제 정보를 수정할 수 없습니다.');
      }

      const paymentInfo = await manager.findOneBy(PaymentInfo, { id: reservation.paymentInfoId, userId });
      if (!paymentInfo) throw createError(404, '연결된 결제수단을 찾을 수 없습니다.');

      paymentInfo.method = method;
      paymentInfo.code = bank;
      paymentInfo.displayInfo = masked;
      paymentInfo.details = extra;
      await manager.save(paymentInfo);
    });

    return res.status(StatusCodes.OK).json({ message: '결제정보가 정상적으로 수정되었습니다.' });
  } catch (err: any) {
    console.error(err);
    const status = err.status || StatusCodes.INTERNAL_SERVER_ERROR;
    return res.status(status).json({ message: '결제 수단 수정 실패' });
  }
});

// 펀딩 결제 예약 취소
router.delete('/:id', (req, res) => {
  return res.status(StatusCodes.OK).json({ message: '펀딩 결제 예약 취소' });
});

export default router;
