import { Request, Response } from 'express';
import axios from 'axios';
import { AppDataSource } from '../data-source';
import { User } from '@shared/entities';
import { Token } from '@shared/entities';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import StatusCode from 'http-status-codes';
dotenv.config();

export const google = async (req: Request, res: Response) => {
  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=email`;
  res.redirect(redirectUrl);
};

export const googleCallBack = async (req: Request, res: Response) => {
  const code = req.query.code;
  if (!code) {
    return res.status(StatusCode.BAD_REQUEST).json({ message: '인가 코드 필요' });
  }

  const userRepo = AppDataSource.getRepository(User);
  const tokenRepo = AppDataSource.getRepository(Token);

  try {
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token } = tokenResponse.data;

    const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { id: snsId, email, name: nickname } = profileResponse.data;
    const provider = 'google';

    let user = await userRepo.findOne({ where: { provider, snsId } });
    if (!user) {
      user = userRepo.create({
        provider,
        snsId,
        email,
        nickname: nickname || `user_${snsId.slice(0, 39)}`,
      });
      await userRepo.save(user);
    }

    const accessToken = jwt.sign({ userId: user.userId, email: user.email }, process.env.PRIVATE_KEY as string, {
      expiresIn: '30m',
      issuer: 'Fundi',
    });
    const refreshToken = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '7d', issuer: 'Fundi' }
    );

    const newToken = tokenRepo.create({
      user,
      refreshToken,
      revoke: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await tokenRepo.save(newToken);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 30,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.redirect('http://localhost:5000');
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Google 로그인 실패' });
  }
};

export const kakao = async (req: Request, res: Response) => {
  const redirectUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code&scope=profile_nickname%20account_email`;
  res.redirect(redirectUrl);
};

export const kakaoCallBack = async (req: Request, res: Response) => {
  const code = req.query.code;
  if (!code) {
    return res.status(StatusCode.BAD_REQUEST).json({ message: '인가 코드 필요' });
  }

  const userRepo = AppDataSource.getRepository(User);
  const tokenRepo = AppDataSource.getRepository(Token);

  try {
    const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', null, {
      params: {
        code,
        client_id: process.env.KAKAO_CLIENT_ID,
        client_secret: process.env.KAKAO_CLIENT_SECRET,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        grant_type: 'authorization_code',
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token } = tokenResponse.data;

    const profileResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const kakaoAccount = profileResponse.data.kakao_account;
    const email = kakaoAccount.email;
    const nickname = kakaoAccount.profile.nickname;
    const snsId = profileResponse.data.id;
    const provider = 'kakao';

    let user = await userRepo.findOne({ where: { provider, snsId } });
    if (!user) {
      user = userRepo.create({
        provider,
        snsId,
        email,
        nickname: nickname || `user_${snsId.slice(0, 39)}`,
      });
      await userRepo.save(user);
    }

    const accessToken = jwt.sign({ userId: user.userId, email: user.email }, process.env.PRIVATE_KEY as string, {
      expiresIn: '30m',
      issuer: 'Fundi',
    });
    const refreshToken = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '7d', issuer: 'Fundi' }
    );

    const newToken = tokenRepo.create({
      user,
      refreshToken,
      revoke: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await tokenRepo.save(newToken);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 30,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.redirect('http://localhost:5000');
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: 'KaKao 로그인 실패' });
  }
};

export const naver = async (req: Request, res: Response) => {
  const redirectUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${process.env.NAVER_CLIENT_ID}&redirect_uri=${process.env.NAVER_REDIRECT_URI}&state=naverLogin&scope=name%20email`;
  res.redirect(redirectUrl);
};

export const naverCallBack = async (req: Request, res: Response) => {
  const code = req.query.code;
  if (!code) {
    return res.status(StatusCode.BAD_REQUEST).json({ message: '인가 코드 필요' });
  }

  const userRepo = AppDataSource.getRepository(User);
  const tokenRepo = AppDataSource.getRepository(Token);

  try {
    const tokenResponse = await axios.post('https://nid.naver.com/oauth2.0/token', null, {
      params: {
        code,
        client_id: process.env.NAVER_CLIENT_ID,
        client_secret: process.env.NAVER_CLIENT_SECRET,
        redirect_uri: process.env.NAVER_REDIRECT_URI,
        grant_type: 'authorization_code',
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token } = tokenResponse.data;

    const profileResponse = await axios.get('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { id: snsId, email, name: nickname } = profileResponse.data.response;
    const provider = 'naver';

    let user = await userRepo.findOne({ where: { provider, snsId } });
    if (!user) {
      user = userRepo.create({
        provider,
        snsId,
        email,
        nickname: nickname || `user_${snsId.slice(0, 39)}`,
      });
      await userRepo.save(user);
    }

    const accessToken = jwt.sign({ userId: user.userId, email: user.email }, process.env.PRIVATE_KEY as string, {
      expiresIn: '30m',
      issuer: 'Fundi',
    });
    const refreshToken = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '7d', issuer: 'Fundi' }
    );

    const newToken = tokenRepo.create({
      user,
      refreshToken,
      revoke: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await tokenRepo.save(newToken);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 30,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.redirect('http://localhost:5000');
  } catch (err) {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Naver 로그인 실패' });
  }
};
