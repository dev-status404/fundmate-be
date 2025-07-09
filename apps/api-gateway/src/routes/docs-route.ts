import swaggerUi from 'swagger-ui-express';
import { Router } from 'express';

const router = Router();

// The previous dynamic configuration may be causing startup issues.
// This is a minimal swagger setup to help debug the problem.
router.use('/', swaggerUi.serve, swaggerUi.setup({}));

export default router;
