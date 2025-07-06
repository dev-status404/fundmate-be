import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { EmailVerification } from '@shared/entities';
import { User } from '@shared/entities';
import { InterestCategory } from '@shared/entities';
import { Token } from '@shared/entities';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import StatusCode from 'http-status-codes';
import { ensureAuthorization } from '../middleware/ensureAuthorization';
import { jwtErrorHandler } from '../middleware/jwtErrorHandler';
dotenv.config();

export const sendVerificationCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(StatusCode.BAD_REQUEST).json({ message: '이메일 입력 필요' });
  }

  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 랜덤 코드 생성
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5분 후 코드 만료하기 위해

    const verificationRepo = AppDataSource.getRepository(EmailVerification);

    await verificationRepo.update({ email, isUsed: false }, { expiresAt: new Date() });

    const newCode = verificationRepo.create({
      email,
      code,
      expiresAt: expiresAt,
    });
    await verificationRepo.save(newCode);

    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Fundmate" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '[Fundmate] 이메일 인증 코드입니다.',
      text: `인증 코드는 ${code}이며, 5분 후 만료됩니다. 시간 내에 입력해 주세요.`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(StatusCode.OK).json({ message: '이메일 인증 코드 전송 완료' });
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: '이메일 인증 코드 전송 실패' });
  }
};

export const verifyEmailCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(StatusCode.BAD_REQUEST).json({ message: '이메일 및 인증 코드 입력 필요' });
  }

  const verificationRepo = AppDataSource.getRepository(EmailVerification);

  try {
    const record = await verificationRepo.findOne({
      where: { email, code, isUsed: false },
      order: { verificationId: 'DESC' },
    });

    if (!record) {
      return res.status(StatusCode.BAD_REQUEST).json({ message: '잘못된 인증 코드' });
    }

    if (new Date() > record.expiresAt) {
      return res.status(StatusCode.GONE).json({ message: '인증 코드 만료' });
    }

    record.isUsed = true;
    await verificationRepo.save(record);

    return res.status(StatusCode.OK).json({ message: '이메일 인증 성공' });
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: '이메일 인증 실패' });
  }
};

export const signUp = async (req: Request, res: Response) => {
  const { nickname, email, code, password, confirm_password, category_id } = req.body;
  const categoryId = category_id;

  const userRepo = AppDataSource.getRepository(User);
  const emailVerificationRepo = AppDataSource.getRepository(EmailVerification);
  const interestCategoryRepo = AppDataSource.getRepository(InterestCategory);

  try {
    if (password !== confirm_password) {
      return res.status(StatusCode.BAD_REQUEST).json({ message: '비밀번호 불일치' });
    }

    const record = await emailVerificationRepo.findOneBy({
      email,
      code,
      isUsed: true,
    });

    if (!record) {
      return res.status(StatusCode.BAD_REQUEST).json({ message: '이메일 인증 필요' });
    }
    if (new Date() > record.expiresAt) {
      return res.status(StatusCode.GONE).json({ message: '인증 코드 만료' });
    }

    const existingUser = await userRepo.findOneBy({ email });
    if (existingUser) {
      return res.status(StatusCode.CONFLICT).json({ message: '이미 가입된 이메일' });
    }

    const salt = crypto.randomBytes(32).toString('base64');
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('base64');

    const newUser = userRepo.create({
      nickname,
      email,
      password: hashPassword,
      salt,
    });
    const savedUser = await userRepo.save(newUser);

    await interestCategoryRepo.save({
      user: savedUser,
      category: { categoryId: categoryId },
    });

    return res.status(StatusCode.CREATED).json({ message: '회원 가입 성공' });
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: '회원 가입 실패' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(StatusCode.BAD_REQUEST).json({ message: '이메일 및 비밀번호 입력 필요' });
  }

  try {
    const userRepo = AppDataSource.getRepository(User);
    const tokenRepo = AppDataSource.getRepository(Token);
    const user = await userRepo.findOneBy({ email });

    if (!user || !user.password || !user.salt) {
      return res.status(StatusCode.UNAUTHORIZED).json({ message: '잘못된 이메일 또는 비밀번호' });
    }

    const hashPassword = crypto.pbkdf2Sync(password, user.salt, 10000, 64, 'sha512').toString('base64');

    if (hashPassword !== user.password) {
      return res.status(StatusCode.UNAUTHORIZED).json({ message: '잘못된 이메일 또는 비밀번호' });
    }

    const accessToken = jwt.sign({ userId: user.userId, email: user.email }, process.env.PRIVATE_KEY as string, {
      expiresIn: '30m',
      issuer: 'Fundi',
    });

    const refreshToken = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: '7d',
        issuer: 'Fundi',
      }
    );

    const newToken = tokenRepo.create({
      user,
      refreshToken,
      revoke: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await tokenRepo.save(newToken);

    res.cookie('accessToken', accessToken, {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
    });

    return res.status(StatusCode.OK).json({ message: '로그인 성공' });
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: '로그인 실패' });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  const tokenRepo = AppDataSource.getRepository(Token);
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(StatusCode.UNAUTHORIZED).json({ message: '리프레시 토큰 필요' });
  }

  try {
    const userInfo = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as { userId: number };

    const tokenRecord = await tokenRepo.findOne({
      where: {
        refreshToken,
        revoke: false,
      },
      relations: ['user'],
    });

    if (!tokenRecord) {
      return res.status(StatusCode.UNAUTHORIZED).json({ message: '유효하지 않은 리프레시 토큰' });
    }

    const newAccessToken = jwt.sign({ userId: userInfo.userId }, process.env.PRIVATE_KEY as string, {
      expiresIn: '30m',
      issuer: 'Fundi',
    });

    res.cookie('accessToken', newAccessToken, {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
    });

    return res.status(StatusCode.OK).json({ message: '토큰 갱신 완료' });
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.UNAUTHORIZED).json({ message: '리프레시 토큰 검증 실패' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, code, new_password, confirm_password } = req.body;

  const userRepo = AppDataSource.getRepository(User);
  const emailVerificationRepo = AppDataSource.getRepository(EmailVerification);

  try {
    if (new_password !== confirm_password) {
      return res.status(StatusCode.BAD_REQUEST).json({ message: '비밀번호 불일치' });
    }

    const record = await emailVerificationRepo.findOne({
      where: { email, code, isUsed: true },
      order: { verificationId: 'DESC' },
    });

    if (!record) {
      return res.status(StatusCode.BAD_REQUEST).json({ message: '이메일 인증 필요' });
    }
    if (new Date() > record.expiresAt) {
      return res.status(StatusCode.GONE).json({ message: '인증 코드 만료' });
    }

    const user = await userRepo.findOneBy({ email });
    if (!user) {
      return res.status(StatusCode.NOT_FOUND).json({ message: '존재하지 않는 유저' });
    }

    const newSalt = crypto.randomBytes(32).toString('base64');
    const hashPassword = crypto.pbkdf2Sync(new_password, newSalt, 10000, 64, 'sha512').toString('base64');

    user.salt = newSalt;
    user.password = hashPassword;
    await userRepo.save(user);

    return res.status(StatusCode.OK).json({ message: '비밀번호 재설정 성공' });
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: '비밀번호 재설정 실패' });
  }
};

export const logout = async (req: Request, res: Response) => {
  const tokenRepo = AppDataSource.getRepository(Token);
  const authorization = ensureAuthorization(req);

  if (authorization instanceof Error) {
    return jwtErrorHandler(authorization, res);
  }

  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(StatusCode.UNAUTHORIZED).json({ message: '리프레시 토큰 필요' });
  }

  try {
    const tokenRecord = await tokenRepo.findOne({
      where: {
        user: { userId: authorization.userId },
        refreshToken,
        revoke: false,
      },
      relations: ['user'],
    });

    if (tokenRecord) {
      tokenRecord.revoke = true;
      await tokenRepo.save(tokenRecord);
    }

    res.clearCookie('accessToken', {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
    });
    res.clearCookie('refreshToken', {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
    });

    return res.status(StatusCode.OK).json({ message: '로그아웃 성공' });
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.UNAUTHORIZED).json({ message: '로그아웃 실패' });
  }
};
