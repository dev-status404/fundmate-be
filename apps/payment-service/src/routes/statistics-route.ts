import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppDataSource } from '../data-source';
import { PaymentHistory, PaymentSchedule } from '@shared/entities';
import { Between } from 'typeorm';
import { serviceClients } from '@shared/config';

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
    console.error(err);
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
    const totalCountAll = allScheduleCount + allHistoryCount;

    if (typeof startDate !== 'string' || typeof endDate !== 'string') {
      return res.status(StatusCodes.OK).json({ totalAmount: totalAmountAll, totalCount: totalCountAll });
    }

    const historyWhere: any = { userId, status: 'success' };
    const scheduleWhere: any = { userId };

    if (typeof startDate === 'string' && typeof endDate === 'string') {
      scheduleWhere.createdAt = Between(new Date(startDate), new Date(endDate));
      historyWhere.executedAt = Between(new Date(startDate), new Date(endDate));
    }

    const [periodSchedules, periodScheduleCount] = await paymentScheduleRepo.findAndCount({ where: scheduleWhere });
    const periodScheduleAmount = periodSchedules.reduce((acc, cur) => acc + cur.totalAmount, 0);

    const [periodHistories, periodHistoryCount] = await paymentHistoryRepo.findAndCount({ where: historyWhere });
    const periodHistoryAmount = periodHistories.reduce((acc, cur) => acc + cur.totalAmount, 0);

    const periodAmount = periodScheduleAmount + periodHistoryAmount;
    const periodSponsorCount = periodHistoryCount;
    const periodCheckOut = periodScheduleCount

    return res.status(StatusCodes.OK).json({
      totalAmount: totalAmountAll,
      totalcount: totalCountAll,
      period: {
        startDay:startDate,
        endDay:endDate,
        amount:periodAmount,
        sponsorCount:periodSponsorCount,
        checkOut:periodCheckOut
      }
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

export interface MyProjectListItem {
  project_id: number;
  image_url: string;
  title: string;
  short_description: string;
  current_amount: number;
  achievement: number;
  remaining_day: number;
}

export interface GraphData{
  x: number;
  y: number;
}

// 통계용 그래프
router.get("/graph", async (req, res)=>{
  const { userId, email} = res.locals.user;
  if (!userId) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: '로그인이 필요합니다.' });
  }

  let targetStr: string;
  const { target } = req.query;
  if (typeof target !== 'string' || target.trim() === '') {
    const now = new Date();
    const yyyy = now.getFullYear();
    // 월은 0부터 시작하므로 +1, 두 자리로 패딩
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    targetStr = `${yyyy}-${mm}`;
  } else {
    targetStr = target;
  }

    const regex = /^\d{4}-(0[1-9]|1[0-2])$/;
  if (!regex.test(targetStr)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: 'target 형식이 잘못되었습니다. "YYYY-MM" 형태여야 합니다.' });
  }

  const [yearStr, monthStr] = targetStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const start = new Date(year, month - 1, 1, 0, 0, 0);
  const end   = new Date(year, month, 0, 23, 59, 59);
  const daysInMonth = end.getDate();

  try{
    const fundingClient = serviceClients['funding-service'];
    fundingClient.setAuthContext({
      userId,
      email,
      accessToken:  req.header('x-access-token')  || '',
      refreshToken: req.header('x-refresh-token') || '',
    });
    const projectList = await fundingClient.get<MyProjectListItem[]>('/profiles/my-projects');
    const myFundingIdList = projectList.data.map( p => p.project_id);
    if (myFundingIdList.length === 0) {

      return res.status(StatusCodes.OK).json({
          meta: {
            year,
            month,
            daysInMonth,
          },
          data: [
            { id: 'amount', data: [] },
            { id: 'count',  data: [] },
          ]
        });
      }

    const emptyDayArray = Array.from({ length: daysInMonth }, (_, i) => i+1);

    const historyRepo = AppDataSource.getRepository(PaymentHistory);
    const rawHistory = await historyRepo
      .createQueryBuilder('h')
      .select("DAY(CONVERT_TZ(h.created_at, '+00:00', '+09:00'))", 'day')
      .addSelect('COALESCE(SUM(h.total_amount), 0)', 'totalAmount')
      .addSelect('COUNT(DISTINCT h.user_id)', 'sponsorCount')
      .where('h.status = :status', { status: 'success' })
      .andWhere('h.project_id IN (:...ids)', { ids: myFundingIdList })
      .andWhere('h.created_at BETWEEN :start AND :end', { start, end })
      .groupBy('day')
      .orderBy('day')
      .getRawMany<{ day: string; totalAmount: string; sponsorCount: string }>();

    const scheduleRepo = AppDataSource.getRepository(PaymentSchedule);
    const rawSchedule = await scheduleRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.project', 'project')
      .select("DAY(CONVERT_TZ(s.created_at, '+00:00', '+09:00'))", 'day')
      .addSelect('COALESCE(SUM(s.total_amount), 0)', 'totalAmount')
      .addSelect('COUNT(*)', 'scheduleCount')
      .where('s.executed = :exec', { exec: false })
      .andWhere('project.project_id IN (:...ids)', { ids: myFundingIdList })
      .andWhere('s.created_at BETWEEN :start AND :end',{ start, end })
      .groupBy('day')
      .orderBy('day')
      .getRawMany<{ day: string; totalAmount: string; scheduleCount: string }>();
    
    const historyMap = new Map(rawHistory.map(r => [Number(r.day), r]));
    const scheduleMap = new Map(rawSchedule.map(r => [Number(r.day), r]));

    const amountData:GraphData[] = [];
    const countData:GraphData[] = [];

    emptyDayArray.forEach(d => {
      const h = historyMap.get(d);
      const s = scheduleMap.get(d);

      amountData.push({ x: d, y: (h ? +h.totalAmount : 0) + (s ? +s.totalAmount : 0) });
      countData.push({ x: d, y: (h ? +h.sponsorCount : 0) + (s ? +s.scheduleCount : 0) });
    });

    const amountSeries = {
      id: 'amount',
      data: amountData,
    };
    const countSeries = {
      id: 'count',
      data: countData,
    };

    return res.status(StatusCodes.OK).json({
      meta: {
        year,
        month,
        daysInMonth,
      },
      data: [ amountSeries, countSeries ]
    });

  }catch(err){
    console.error(err)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '그래프 데이터 불러오기 실패'})
  }
})
export default router;
