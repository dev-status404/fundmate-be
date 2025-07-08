import { Request, Response } from 'express';
import axios from 'axios';
import { serviceConfig } from '@shared/config';

export const healthCheck = async (_req: Request, res: Response) => {
  const services = Object.values(serviceConfig).map((service) => ({
    name: service.name,
    url: `${service.url}/health`,
  }));

  const results = await Promise.all(
    services.map(async ({ name, url }) => {
      try {
        const start = Date.now();
        const resp = await axios.get(url, { timeout: 5000 });
        return {
          name,
          status: resp.status === 200 ? 'ok' : 'error',
          latency: Date.now() - start,
        };
      } catch (err) {
        return {
          name,
          status: 'down',
          error: err instanceof Error ? err.stack : String(err),
        };
      }
    })
  );

  const overall = results.every((r) => r.status === 'ok') ? 'ok' : 'degraded';
  res.status(overall === 'ok' ? 200 : 500).json({ overall, services: results });
};
