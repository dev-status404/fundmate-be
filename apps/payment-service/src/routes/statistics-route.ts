import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppDataSource } from '../data-source';
import { PaymentHistory, PaymentSchedule } from '@shared/entities';

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

export default router;
