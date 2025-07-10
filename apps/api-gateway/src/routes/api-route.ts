import { Router } from 'express';
import { detectService, forwardRequest } from '../controllers/api-controller';
// import { jwtMiddleware } from '../middlewares/jwt-middleware';

const router = Router();

router.use(detectService);
// router.use(jwtMiddleware);
router.all('/*', forwardRequest);

export default router;
