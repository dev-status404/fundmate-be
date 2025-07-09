import express from 'express';
import {
  getFundingComments,
  getMyFundingList,
  getMyFundingRecentlyFinished,
  getOthersFundingList,
} from '../controller/ProfileController';
const router = express.Router();

router.get('/recent-completed', getMyFundingRecentlyFinished);
router.get('/my-projects', getMyFundingList);
router.get('/:id', getOthersFundingList);
router.get('/comments', getFundingComments);

export default router;
