import express from 'express';
import { createFunding, getFundingDetail, getFundingSummary } from '../controller/FundingController';

const router = express.Router();

router.post('/', createFunding);
router.get('/:id', getFundingDetail);
router.get('/summary', getFundingSummary);

export default router;
