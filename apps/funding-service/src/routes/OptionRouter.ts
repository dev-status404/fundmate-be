import express from 'express';
import { createOption, deleteOption } from '../controller/OptionController';

const router = express.Router();

router.post('/', createOption);
router.delete('/:id', deleteOption);

export default router;
