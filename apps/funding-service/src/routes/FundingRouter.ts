import express from 'express';
import { createFundingAndOption, getFundingDetail, getFundingSummary } from '../controller/FundingController';

const router = express.Router();

router.post('/', createFundingAndOption);
router.get('/:id', getFundingDetail);

export default router;
