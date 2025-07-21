import express from 'express';
import { deleteOption } from '../controller/OptionController';

const router = express.Router();

router.delete('/:id', deleteOption);

export default router;
