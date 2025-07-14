import express from 'express';
import { google, googleCallBack, kakao, kakaoCallBack, naver, naverCallBack } from '../controller/OAuthController';
const router = express.Router();

router.use(express.json());

router.get('/google', google);
router.get('/google/callback', googleCallBack);
router.get('/kakao', kakao);
router.get('/kakao/callback', kakaoCallBack);
router.get('/naver', naver);
router.get('/naver/callback', naverCallBack);

export default router;
