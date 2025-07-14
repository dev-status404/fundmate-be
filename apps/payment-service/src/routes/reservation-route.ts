import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppDataSource } from '../data-source';
import { PaymentHistory, PaymentInfo, PaymentSchedule } from '@shared/entities';
import createError from 'http-errors';

const router = Router();

/**
 * TODO:
 * - 총 모금액, 총 후원자 수
 * - 오늘 내 프로젝트 결제 건수, 오늘까지의 모든 프로젝트 총 수익, 오늘까지의 모든 프로젝트 미결제 및 실패 수,
 *   결제 내역 리스트(상품 이미지, 상품명, 옵션명, 결제 날짜, 금액, 상태)
 * - 오늘 내 프로젝트 결제 건수, 오늘까지의 모든 프로젝트 총 수익, 오늘까지의 모든 프로젝트 미결제 및 실패 수, 결제 내역 리스트(상품 이미지, 상품명, 옵션명, 결제 날짜, 금액, 상태)
 **/

// 펀딩 전체 갯수
router.get('/count', async (req, res) => {
  const { userId } = res.locals.user;
  if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: '로그인이 필요합니다.' });
  try {
    const paymentScheduleRepo = AppDataSource.getRepository(PaymentSchedule);
    const paymentHistoryRepo = AppDataSource.getRepository(PaymentHistory);

    const countBySchedule = await paymentScheduleRepo.count({ where: { userId } });
    const countByHistory = await paymentHistoryRepo.count({ where: { userId, status: 'success' } });

    return res
      .status(StatusCodes.OK)
      .json({ count: countBySchedule + countByHistory, countBySchedule, countByHistory });
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '펀딩 갯수 조회 실패' });
  }
});

// 펀딩 결제 및 예약 내역 전체 조회
router.get('/', async (req, res) => {
  const { userId } = res.locals.user;
  if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: '로그인이 필요합니다.' });
  try {
    const paymentScheduleRepo = AppDataSource.getRepository(PaymentSchedule);
    const findBySchedule = await paymentScheduleRepo.findBy({ userId });
    if (findBySchedule.length === 0) throw createError(StatusCodes.NOT_FOUND, '예약된 정보가 없습니다.');
    return res.status(StatusCodes.OK).json(findBySchedule);
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '전체 펀딩 조회 실패' });
  }
});

// 펀딩 결제 및 예약 내역 상세 조회
router.get('/:id', (req, res) => {
  const { userId } = res.locals.user;
  if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: '로그인이 필요합니다.' });
  const reservationId = +req.params.id;
  try {
    const paymentScheduleRepo = AppDataSource.getRepository(PaymentSchedule);
    const findBySchedule = paymentScheduleRepo.findOneBy({ id: reservationId, userId });
    if (!findBySchedule) throw createError(StatusCodes.NOT_FOUND, '예약된 정보가 없습니다.');
    return res.status(StatusCodes.OK).json(findBySchedule);
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '펀딩 조회 실패' });
  }
});

// 펀딩 결제 및 예약 등록
router.post('/', async (req, res) => {
  const { userId } = res.locals.user;
  if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: '로그인이 필요합니다.' });
  const { paymentInfoId, rewardId, projectId, amount, totalAmount, scheduleDate, address, addressNumber, addressInfo } =
    req.body;
  if (!paymentInfoId || !projectId || !amount || !totalAmount || !scheduleDate) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: '펀딩 등록 정보가 누락 되었습니다.' });
  }
  try {
    const scheduleRepo = AppDataSource.getRepository(PaymentSchedule);
    const newSchedule = scheduleRepo.create({
      userId,
      rewardId,
      paymentInfoId,
      projectId,
      amount,
      totalAmount,
      scheduleDate,
      address,
      addressNumber,
      addressInfo,
    });
    const savedSchedule = await scheduleRepo.save(newSchedule);
    return res.status(StatusCodes.CREATED).json(savedSchedule);
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '펀딩 등록 실패' });
  }
});

// 펀딩 결제 및 예약 정보 수정
router.patch('/:id', async (req, res) => {
  const { userId } = res.locals.user;
  if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: '로그인이 필요합니다.' });
  const reservationId = +req.params.id;
  // TODO: 이부분 어떤 정보 들어오는지 물어봐야겠다
  const updates = req.body;
  try {
    const scheduleRepo = AppDataSource.getRepository(PaymentSchedule);
    const schedule = await scheduleRepo.findOneBy({ id: reservationId, userId });
    if (!schedule) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: '예약된 정보가 없습니다.' });
    }
    const now = new Date();
    const payDate = schedule.scheduleDate;
    const isOneDayAgo = payDate.getTime() - now.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (isOneDayAgo <= oneDayMs) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: '결제 예정일 하루 전에는 결제 정보를 수정할 수 없습니다.' });
    }
    await scheduleRepo.update(reservationId, updates);
    return res.status(StatusCodes.OK).json({ message: '펀딩 정보가 정상적으로 수정되었습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '펀딩 수정 실패' });
  }
});

// 결제 정보 수정
router.patch('/:id/payment_methods', async (req, res) => {
  const { userId } = res.locals.user;
  if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: '로그인이 필요합니다.' });
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
router.delete('/:id', async (req, res) => {
  const { userId } = res.locals.user;
  if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: '로그인이 필요합니다.' });
  const reservationId = +req.params.id;
  try {
    await AppDataSource.transaction(async (manager) => {
      const schedule = await manager.findOneBy(PaymentSchedule, { id: reservationId, userId });
      if (!schedule) throw createError(404, '예약된 정보가 없습니다.');
      const { id, ...restForHistory } = schedule;
      const history = manager.create(PaymentHistory, {
        ...restForHistory,
        scheduleId: id,
        status: 'cancel',
      });
      await manager.save(history);
      await manager.remove(schedule);
    });
    return res.status(StatusCodes.OK).json({ message: '예약이 취소되었습니다.' });
  } catch (err: any) {
    console.error(err);
    const status = err.status || StatusCodes.INTERNAL_SERVER_ERROR;
    return res.status(status).json({ message: '예약 취소 실패' });
  }
});

export default router;
