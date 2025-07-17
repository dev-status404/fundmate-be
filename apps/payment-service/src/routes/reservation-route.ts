import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppDataSource } from '../data-source';
import { PaymentHistory, PaymentInfo, PaymentSchedule, OptionData, Project } from '@shared/entities';
import createError from 'http-errors';
import { DeepPartial } from 'typeorm';

const router = Router();

// 펀딩 결제 및 예약 내역 전체 조회
router.get('/', async (req, res) => {
  const { userId } = res.locals.user;
  if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: '로그인이 필요합니다.' });
  try {
    const paymentScheduleRepo = AppDataSource.getRepository(PaymentSchedule);
    const [findBySchedule, count] = await paymentScheduleRepo.findAndCount({
      where: { userId },
      relations: ['project', 'option'],
    });
    if (findBySchedule.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: '예약된 정보가 없습니다.' });
    }
    const data = findBySchedule.map((schedule) => ({
      scheduleId: schedule.id,
      productImage: schedule.project.imageUrl,
      productName: schedule.project.title,
      optionName: schedule.option?.title ?? null,
      totalAmount: schedule.totalAmount,
      scheduleDate: schedule.scheduleDate,
      createdAt: schedule.createdAt,
    }));

    return res.status(StatusCodes.OK).json({ data, count });
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '전체 펀딩 조회 실패' });
  }
});

// 펀딩 결제 및 예약 내역 상세 조회
router.get('/:id', async (req, res) => {
  const { userId } = res.locals.user;
  if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: '로그인이 필요합니다.' });
  const reservationId = +req.params.id;
  try {
    const paymentScheduleRepo = AppDataSource.getRepository(PaymentSchedule);
    const findBySchedule = await paymentScheduleRepo.findOne({
      where: { id: reservationId, userId },
      relations: ['project', 'option', 'paymentInfo'],
    });
    if (!findBySchedule) throw createError(StatusCodes.NOT_FOUND, '예약된 정보가 없습니다.');

    const schedule = findBySchedule;
    const result = {
      id: schedule.id,
      userId: schedule.userId,
      rewardId: schedule.option?.optionId ?? null,
      paymentInfoId: schedule.paymentInfo.id,
      productImage: schedule.project.imageUrl,
      productName: schedule.project.title,
      optionName: schedule.option?.title ?? null,
      optionAmount: schedule.option?.price ?? null,
      amount: schedule.amount,
      donateAmount: schedule.donateAmount ?? null,
      totalAmount: schedule.totalAmount,
      scheduleDate: schedule.scheduleDate,
      executed: schedule.executed,
      createdAt: schedule.createdAt,
      address: schedule.address ?? null,
      addressNumber: schedule.addressNumber ?? null,
      addressInfo: schedule.addressInfo ?? null,
      retryCount: schedule.retryCount,
      lastErrorMessage: schedule.lastErrorMessage ?? null,
    };
    return res.status(StatusCodes.OK).json(result);
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '펀딩 조회 실패' });
  }
});

// 펀딩 결제 및 예약 등록
router.post('/', async (req, res) => {
  const { userId } = res.locals.user;
  if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: '로그인이 필요합니다.' });
  const {
    paymentInfoId,
    rewardId,
    projectId,
    amount,
    rewardAmount,
    donateAmount,
    totalAmount,
    scheduleDate,
    address,
    addressNumber,
    addressInfo,
  } = req.body;
  if (!paymentInfoId || !projectId || !amount || !totalAmount || !scheduleDate) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: '펀딩 등록 정보가 누락 되었습니다.' });
  }
  if (totalAmount !== (rewardId ? rewardAmount ?? 0 : 0) + (donateAmount ?? 0) + amount) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: '금액이 맞지 않습니다' });
  }
  try {
    // 사전 검증: 외래키 참조 대상이 존재하는지 확인
    const paymentInfoRepo = AppDataSource.getRepository(PaymentInfo);
    const projectRepo = AppDataSource.getRepository(Project);
    const optionRepo = AppDataSource.getRepository(OptionData);

    const paymentInfoExist = await paymentInfoRepo.findOneBy({ id: paymentInfoId });
    if (!paymentInfoExist) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: '유효하지 않은 결제 수단 ID입니다.' });
    }

    const projectExist = await projectRepo.findOneBy({ projectId });
    if (!projectExist) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: '유효하지 않은 프로젝트 ID입니다.' });
    }

    if (rewardId !== undefined && rewardId !== null) {
      const optionExist = await optionRepo.findOneBy({ optionId: rewardId });
      if (!optionExist) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: '유효하지 않은 옵션 ID입니다.' });
      }
    }
    const scheduleRepo = AppDataSource.getRepository(PaymentSchedule);
    const newSchedule = scheduleRepo.create({
      userId,
      option: { optionId: rewardId },
      paymentInfo: { id: paymentInfoId },
      project: { projectId },
      donateAmount,
      amount,
      totalAmount,
      scheduleDate,
      address,
      addressNumber,
      addressInfo,
    });
    const savedSchedule = await scheduleRepo.save(newSchedule);
    return res.status(StatusCodes.CREATED).json({ insertedId: savedSchedule.id });
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
  try {
    const scheduleRepo = AppDataSource.getRepository(PaymentSchedule);
    const optionRepo = AppDataSource.getRepository(OptionData);
    const schedule = await scheduleRepo.findOne({
      where: { id: reservationId, userId },
      relations: ['option', 'paymentInfo', 'project'],
    });

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

    const {
      rewardId: rawRewardId,
      donateAmount: rawDonateAmount,
      scheduleDate: rawScheduleDate,
      address,
      addressNumber,
      addressInfo,
    } = req.body;
    const scheduleDate = rawScheduleDate !== undefined ? new Date(rawScheduleDate) : undefined;

    if (rawRewardId !== undefined) {
      const optEntity = await optionRepo.findOneBy({ optionId: rawRewardId });
      if (!optEntity) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: '유효하지 않은 옵션 ID입니다.' });
      }
      schedule.option = optEntity;
    }
    if (rawDonateAmount !== undefined) {
      schedule.donateAmount = rawDonateAmount;
      const rewardAmount = schedule.option?.price ?? 0;
      schedule.totalAmount = schedule.amount + rewardAmount + rawDonateAmount;
    }
    if (scheduleDate !== undefined) {
      schedule.scheduleDate = scheduleDate;
    }
    if (address !== undefined) {
      schedule.address = address;
    }
    if (addressNumber !== undefined) {
      schedule.addressNumber = addressNumber;
    }
    if (addressInfo !== undefined) {
      schedule.addressInfo = addressInfo;
    }

    await scheduleRepo.save(schedule);
    return res.status(StatusCodes.OK).json({ message: '펀딩 정보가 정상적으로 수정되었습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '펀딩 수정 실패' });
  }
});

// 결제 정보 수정
router.put('/:id/payment_info', async (req, res) => {
  const { userId } = res.locals.user;
  if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: '로그인이 필요합니다.' });
  const reservationId = +req.params.id;
  const { method, code, token, displayInfo, details } = req.body;
  if (!method || !code || !token || !displayInfo || !details) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: '올바른 결제정보를 입력해주세요' });
  }
  try {
    await AppDataSource.transaction(async (manager) => {
      const reservation = await manager.findOne(PaymentSchedule, {
        where: { id: reservationId, userId },
        relations: ['paymentInfo'],
      });
      if (!reservation) throw createError(StatusCodes.NOT_FOUND, '예약된 정보가 없습니다.');

      const now = new Date();
      const payDate = reservation.scheduleDate;
      const isOneDayAgo = payDate.getTime() - now.getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (isOneDayAgo <= oneDayMs) {
        throw createError(StatusCodes.FORBIDDEN, '결제 예정일 하루 에는 결제 정보를 수정할 수 없습니다.');
      }

      const paymentInfo = await manager.findOneBy(PaymentInfo, { id: reservation.paymentInfo.id });
      if (!paymentInfo) throw createError(404, '연결된 결제수단을 찾을 수 없습니다.');

      await manager.save(PaymentInfo, {
        id: paymentInfo.id,
        method,
        code,
        displayInfo,
        details,
      });
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
      const schedule = await manager.findOne(PaymentSchedule, {
        where: { id: reservationId, userId },
        relations: ['option', 'project', 'paymentInfo'],
      });
      if (!schedule) throw createError(404, '예약된 정보가 없습니다.');
      const historyRepo = manager.getRepository(PaymentHistory);
      const historyEntity = historyRepo.create({
        userId: userId,
        scheduleId: schedule.id,
        paymentInfoId: schedule.paymentInfo.id,
        paymentMethod: schedule.paymentInfo.method,
        bankCode: schedule.paymentInfo.code,
        displayInfo: schedule.paymentInfo.displayInfo,
        rewardId: schedule.option?.optionId ?? null,
        projectId: schedule.project.projectId,
        optionTitle: schedule.option?.title,
        optionAmount: schedule.option?.price,
        projectTitle: schedule.project.title,
        projectImage: schedule.project.imageUrl,
        amount: schedule.amount,
        donateAmount: schedule.donateAmount ?? null,
        totalAmount: schedule.totalAmount,
        address: schedule.address ?? null,
        addressNumber: schedule.addressNumber ?? null,
        addressInfo: schedule.addressInfo ?? null,
        executedAt: new Date(),
        status: 'cancel',
        createdAt: schedule.createdAt,
        errorLog: schedule.lastErrorMessage ?? null,
      } as DeepPartial<PaymentHistory>);
      await manager.save(historyEntity);
      await manager.remove(schedule);
    });
    return res.status(StatusCodes.OK).json({
      message: '예약이 취소되었습니다.',
    });
  } catch (err: any) {
    console.error(err);
    const status = err.status || StatusCodes.INTERNAL_SERVER_ERROR;
    return res.status(status).json({ message: '예약 취소 실패' });
  }
});

export default router;
