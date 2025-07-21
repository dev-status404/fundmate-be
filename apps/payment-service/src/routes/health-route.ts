import { Router } from 'express';
import { healthHandler } from './controllers/health-controller';

const router = Router();

router.get('/', healthHandler);

export default router;
