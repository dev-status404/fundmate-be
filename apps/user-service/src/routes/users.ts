import express from 'express';
const router = express.Router();

import {
  deleteUser,
  getMyPage,
  UpdateMyPage,
  getMySupportedProjects,
  getMyComments,
  getMyCreatedProjects,
  getMyProjectStatistics,
  getMyProjectPayments,
} from '../controller/MyPageController';
import { addFollow, deleteFollow, getMyFollowing, getMyFollower } from '../controller/FollowController';
import { getMakerProfile, getSupporterProfile } from '../controller/UserPageController';

router.use(express.json());

router.delete('/account', deleteUser);
router.get('/mypage', getMyPage);
router.put('/mypage', UpdateMyPage);
router.get('/mypage/payments', getMySupportedProjects);
router.get('/mypage/comments', getMyComments);
router.get('/projects', getMyCreatedProjects);
router.get('/projects/statistics', getMyProjectStatistics);
router.get('/projects/payments', getMyProjectPayments);

router.post('/following', addFollow);
router.delete('/following', deleteFollow);
router.get('/mypage/following', getMyFollowing);
router.get('/mypage/follower', getMyFollower);

router.get('/maker/:user_id', getMakerProfile);
router.get('/supporter/:user_id', getSupporterProfile);

export default router;
