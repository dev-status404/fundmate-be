import { Request, Response } from 'express';
// import { StatusCodes } from 'http-status-codes';
// import jwt from 'jsonwebtoken';
// import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

export const sendVerificationCode = (req: Request, res: Response) => {
  res.json('이메일 인증 코드 전송');
};

export const verifyEmailCode = (req: Request, res: Response) => {
  res.json('이메일 인증 코드 확인');
};

export const signUp = (req: Request, res: Response) => {
  res.json('회원가입');
};

export const login = (req: Request, res: Response) => {
  res.json('로그인');
};

export const refreshAccessToken = (req: Request, res: Response) => {
  res.json('토큰 갱신');
};

export const resetPassword = (req: Request, res: Response) => {
  res.json('비밀번호 재설정');
};

export const logout = (req: Request, res: Response) => {
  res.json('로그아웃');
};
