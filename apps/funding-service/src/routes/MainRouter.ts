import express from 'express';
import {
  getAllProjects,
  getDeadlineFundingList,
  getFundingListByCategoryId,
  getMyFundingList,
  getNewFundingList,
  getPopularFundingList,
  getFollowersRecentlyFinished,
  getRecentlyViewedFundingList,
} from '../controller/MainController';

const router = express.Router();

router.get('/', getAllProjects);
router.get('/recent', getRecentlyViewedFundingList);
router.get('/deadline', getDeadlineFundingList);
router.get('/new', getNewFundingList);
router.get('/popular', getPopularFundingList);
router.get('/:id', getFundingListByCategoryId);

router.get('/my-projects', getMyFundingList);
router.get('/recent-completed', getFollowersRecentlyFinished);

export default router;
