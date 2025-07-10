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
router.get('/my-comments', getFundingComments);
router.get('/:id', getOthersFundingList);

export default router;
