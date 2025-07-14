import express from 'express';
import { createOption } from '../controller/OptionController';

const router = express.Router();

router.post('/', createOption);

export default router;
