import express from 'express';
import { interactMain } from '../controller/InteractMainController';

const router = express.Router();
router.use(express.json());
router.get('/', interactMain);

export default router;
