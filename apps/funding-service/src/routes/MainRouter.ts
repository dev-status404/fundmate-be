import express from 'express';
import {
  getAllProjects,
  getDeadlineFundingList,
  getFundingListByCategoryId,
  getNewFundingList,
  getPopularFundingList,
  getRecentlyViewedFundingList,
} from '../controller/MainController';

const router = express.Router();

router.get('/', getAllProjects);
router.get('/recent', getRecentlyViewedFundingList);
router.get('/deadline', getDeadlineFundingList);
router.get('/new', getNewFundingList);
router.get('/popular', getPopularFundingList);
router.get('/:id', getFundingListByCategoryId);

export default router;
