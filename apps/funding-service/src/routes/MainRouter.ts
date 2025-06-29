import express from 'express';
import { getAllProjects, getMyFundingList, getRecentFinishedFundingById } from '../controller/MainController';

const router = express.Router();

router.get('/', getAllProjects);
router.get('/my-projects', getMyFundingList);
router.get('/recent-completed', getRecentFinishedFundingById);

export default router;
