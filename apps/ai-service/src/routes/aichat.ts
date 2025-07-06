import express from 'express';
import { summarize, requests } from '../controller/AiChatController';

const router = express.Router();

router.post('/summarize', summarize);
router.post('/requests', requests);
export default router;
