import { Router } from 'express';
import axios from 'axios';
import { serviceConfig } from '../config/service-config';
import { HttpStatusCode } from 'axios';

const router = Router();
router.all('/*', async (req, res, next) => {
  // 서버별 Path 매핑
  const inputPath = Object.values(serviceConfig).find((service) =>
    service.base.some((basePath) => req.path.startsWith(basePath))
  );

  if (!inputPath) {
    return res.status(HttpStatusCode.NotFound).json({ message: 'Service not found' });
  }

  const { url } = inputPath;
  const targetUrl = `${url}${req.originalUrl}`;

  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: req.headers,
      data: req.body,
    });
    return res.status(response.status).send(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).send(error.response.data);
    } else {
      return next(error);
    }
  }
});

export default router;
