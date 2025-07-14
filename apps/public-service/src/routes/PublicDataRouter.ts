import express from 'express';
import { getDataByKeyword, getDataByOption } from '../controller/PublicDataController';

const router = express.Router();

router.post('/option', getDataByOption);
router.post('/keyword', getDataByKeyword);

export default router;
