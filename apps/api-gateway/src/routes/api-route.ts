import { Router } from 'express';
import { decideJwt, decideService, forwardRequest } from '../controllers/api-controller';

const router = Router();

router.use(decideService);
router.use(decideJwt);
router.all('/*', forwardRequest);

export default router;
