import swaggerUi from 'swagger-ui-express';
import { serviceConfig } from '@shared/config';
import { Router } from 'express'; // Add this import

const router = Router();

router.use(
  '/',
  swaggerUi.serve,
  swaggerUi.setup(null, {
    explorer: true,
    swaggerOptions: {
      urls: Object.values(serviceConfig).map((service) => ({
        name: service.name,
        url: service.swagger,
      })),
    },
  })
);

export default router;
