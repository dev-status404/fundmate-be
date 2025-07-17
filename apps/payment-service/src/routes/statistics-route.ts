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

    const [allSchedules, allScheduleCount] = await paymentScheduleRepo.findAndCount({ where: { userId } });
    const allScheduleAmount = allSchedules.reduce((sum, s) => sum + s.totalAmount, 0);
    const [allHistories, allHistoryCount] = await paymentHistoryRepo.findAndCount({
      where: { userId, status: 'success' },
    });
    const allHistoryAmount = allHistories.reduce((sum, h) => sum + h.totalAmount, 0);
    const totalAmountAll = allScheduleAmount + allHistoryAmount;
    const countAll = allScheduleCount + allHistoryCount;

    if (typeof startDate !== 'string' || typeof endDate !== 'string') {
      return res.status(StatusCodes.OK).json({ totalAmount: totalAmountAll, count: countAll });
    }

    const historyWhere: any = { userId, status: 'success' };
    if (typeof startDate === 'string' && typeof endDate === 'string') {
      historyWhere.executedAt = Between(new Date(startDate), new Date(endDate));
    }

    const scheduleWhere: any = { userId, scheduleDate: Between(new Date(startDate), new Date(endDate)) };

    const [periodSchedules, periodScheduleCount] = await paymentScheduleRepo.findAndCount({ where: scheduleWhere });
    const periodScheduleAmount = periodSchedules.reduce((sum, s) => sum + s.totalAmount, 0);

    const [periodHistories, periodHistoryCount] = await paymentHistoryRepo.findAndCount({ where: historyWhere });
    const periodHistoryAmount = periodHistories.reduce((sum, h) => sum + h.totalAmount, 0);

    const totalAmountPeriod = periodScheduleAmount + periodHistoryAmount;
    const countPeriod = periodScheduleCount + periodHistoryCount;

    return res.status(StatusCodes.OK).json({
      totalAmount: totalAmountAll,
      count: countAll,
      meta: {
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

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
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

    const totalData = [...scheduleData, ...historyData].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const totalItems = totalData.length;
    const totalPages = Math.ceil(totalItems / limit);
    const data = totalData.slice(offset, offset + limit);

    return res.status(StatusCodes.OK).json({
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
      data,
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '결제 내역 조회 실패' });
  }
});

export default router;
