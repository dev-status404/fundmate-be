import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppDataSource } from '../data-source';
import { PaymentHistory, PaymentSchedule } from '@shared/entities';
import { Between } from 'typeorm';

const router = Router();

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

// 총 후원 금액 및 후원 건수
router.get('/summary', async (req, res) => {
  const { userId } = res.locals.user;
  if (!userId) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: '로그인이 필요합니다.' });
  }
  try {
    const { startDate, endDate } = req.query;
    const paymentScheduleRepo = AppDataSource.getRepository(PaymentSchedule);
    const paymentHistoryRepo = AppDataSource.getRepository(PaymentHistory);

    // 1) 전체 스케줄과 히스토리 집계
    const [allSchedules, allScheduleCount] = await paymentScheduleRepo.findAndCount({ where: { userId } });
    const allScheduleAmount = allSchedules.reduce((sum, s) => sum + s.totalAmount, 0);
    const [allHistories, allHistoryCount] = await paymentHistoryRepo.findAndCount({
      where: { userId, status: 'success' },
    });
    const allHistoryAmount = allHistories.reduce((sum, h) => sum + h.totalAmount, 0);
    const totalAmountAll = allScheduleAmount + allHistoryAmount;
    const countAll = allScheduleCount + allHistoryCount;

    // 2) 쿼리가 없으면 전체만 반환
    if (typeof startDate !== 'string' || typeof endDate !== 'string') {
      return res.status(StatusCodes.OK).json({ totalAmount: totalAmountAll, count: countAll });
    }

    // 3) 기간 필터 적용
    // 조건 객체 생성
    const where: any = { userId, status: 'success' };
    // 기간 필터 적용
    if (typeof startDate === 'string' && typeof endDate === 'string') {
      where.executedAt = Between(new Date(startDate), new Date(endDate));
    }
    const scheduleWhere: any = { userId, scheduleDate: Between(new Date(startDate), new Date(endDate)) };
    const [periodSchedules, periodScheduleCount] = await paymentScheduleRepo.findAndCount({ where: scheduleWhere });
    const periodScheduleAmount = periodSchedules.reduce((sum, s) => sum + s.totalAmount, 0);

    const [periodHistories, periodHistoryCount] = await paymentHistoryRepo.findAndCount({ where });
    const periodHistoryAmount = periodHistories.reduce((sum, h) => sum + h.totalAmount, 0);

    const totalAmountPeriod = periodScheduleAmount + periodHistoryAmount;
    const countPeriod = periodScheduleCount + periodHistoryCount;

    return res.status(StatusCodes.OK).json({
      totalAmount: totalAmountAll,
      count: countAll,
      period: {
        startDate,
        endDate,
        totalAmount: totalAmountPeriod,
        count: countPeriod,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '통계 요약 조회 실패' });
  }
});

// 결제 내역 리스트
router.get('/history', async (req, res) => {
  const { userId } = res.locals.user;
  if (!userId) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: '로그인이 필요합니다.' });
  }
  try {
    const paymentScheduleRepo = AppDataSource.getRepository(PaymentSchedule);
    const schedules = await paymentScheduleRepo.find({
      where: { userId },
      relations: ['project', 'option'],
    });
    const scheduleData = schedules.map((schedule) => ({
      scheduleId: schedule.id,
      productImage: schedule.project.imageUrl,
      productName: schedule.project.title,
      optionName: schedule.option?.title ?? null,
      date: schedule.scheduleDate,
      amount: schedule.totalAmount,
      status: schedule.executed ? 'success' : 'pending',
    }));

    const historyRepo = AppDataSource.getRepository(PaymentHistory);
    const histories = await historyRepo.find({ where: { userId } });
    const historyData = histories.map((h) => ({
      scheduleId: h.scheduleId,
      productImage: h.projectImage,
      productName: h.projectTitle,
      optionName: h.optionTitle ?? null,
      date: h.executedAt ?? h.createdAt,
      amount: h.totalAmount,
      status: h.status,
    }));

    const data = [...scheduleData, ...historyData].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return res.status(StatusCodes.OK).json({ data });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '결제 내역 조회 실패' });
  }
});

export default router;
