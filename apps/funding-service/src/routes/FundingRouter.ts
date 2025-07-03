import express from 'express';
import { createFunding, getFundingDetail } from '../controller/FundingController';

const router = express.Router();

router.post('/', createFunding);
router.get('/:id', getFundingDetail);

export default router;
