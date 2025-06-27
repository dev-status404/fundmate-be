import express from 'express';
const router = express.Router();

import { sendVerificationCode, verifyEmailCode, signUp, login, refreshAccessToken, resetPassword, logout } from '../controller/AuthController';

router.use(express.json());

router.post('/codes/send', sendVerificationCode);
router.post('/codes/verify', verifyEmailCode);
router.post('/signup', signUp);
router.post('/login', login);
router.post('/token', refreshAccessToken);
router.patch('/password', resetPassword);
router.post('/logout', logout);

export default router;
