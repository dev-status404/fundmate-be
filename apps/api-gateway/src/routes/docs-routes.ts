import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { serviceConfig } from '../config/service-config';
import path from 'path';
import express from 'express'; // Add this import

const router = Router();

const assetsPath = path.join(__dirname, '..', '..', '..', '..', 'src', 'assets');
router.use('/assets', express.static(assetsPath)); // Change require to express
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
