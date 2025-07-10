import { Response, Request, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppDataSource } from '../data-source';
import { PaymentInfo, PaymentSchedule } from '@shared/entities';
import createError from 'http-errors';

const router = Router();
// 결제 정보 등록
router.post('/', async (req: Request, res: Response) => {
  const { method, bank, token, masked, extra } = req.body;
  const { userId } = res.locals.user;

  if (!method || !bank || !token || !masked || !extra) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: '올바른 결제정보를 입력해주세요' });
  }
  try {
    const repo = AppDataSource.getRepository(PaymentInfo);
    const paymentInfo = await repo.save({
      userId,
      method,
      code: bank,
      token: token,
      displayInfo: masked,
      details: extra,
    });
    const insertedId = paymentInfo.id;
    return res.status(StatusCodes.CREATED).json({ insertedId });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '결제정보 등록 실패' });
  }
});

// 결제 정보 수정
router.patch('/:id', async (req, res) => {
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
    return res.status(status).json({ message: '결제 수단 조회 실패' });
  }
});

// 결제 정보 삭제 -> 이건 아마 함수로만 구현할듯
router.delete('/:id', (req, res) => {
  return res.status(StatusCodes.OK).json({ message: '결제 수단 삭제' });
});

// 결제 정보 전체 조회
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId } = res.locals.user;

    const repo = AppDataSource.getRepository(PaymentInfo);
    const list = await repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return res.status(StatusCodes.OK).json({ data: list });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '결제 수단 조회 실패' });
  }
});

// 결제 정보 조회
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { userId } = res.locals.user;
    const paymentInfoId = +req.params.id;

    const repo = AppDataSource.getRepository(PaymentInfo);
    const item = await repo.findOneBy({ id: paymentInfoId, userId });

    if (!item) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: '결제 수단을 찾을 수 없습니다.' });
    }

    return res.status(StatusCodes.OK).json({ data: item });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '결제 수단 조회 실패' });
  }
});

export default router;
