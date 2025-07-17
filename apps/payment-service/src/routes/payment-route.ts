import { Response, Request, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppDataSource } from '../data-source';
import { PaymentInfo } from '@shared/entities';

const router = Router();
// 결제 정보 등록
router.post('/', async (req: Request, res: Response) => {
  const { method, bank, token, masked, extra } = req.body;
  const { userId } = res.locals.user;
  if (!method || !bank || !masked || !extra) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: '올바른 결제정보를 입력해주세요' });
  }
  try {
    const repo = AppDataSource.getRepository(PaymentInfo);
    const paymentInfo = await repo.save({
      userId,
      method,
      code: bank,
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

// 결제 정보 삭제 -> 이건 아마 함수로만 구현할듯
router.delete('/:id', (req, res) => {
  const paymentInfoId = +req.params.id;
  const { userId } = res.locals.user;
  try {
    const repo = AppDataSource.getRepository(PaymentInfo);
    repo.delete({ id: paymentInfoId, userId });

    return res.status(StatusCodes.OK).json({ message: '결제정보가 정상적으로 삭제되었습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '결제정보 삭제 실패' });
  }
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
