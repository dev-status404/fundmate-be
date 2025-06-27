import express from 'express';
import axios from 'axios';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

const services = [
  { name: 'ai-service', url: `http://localhost:${process.env.PORT_AI || 3001}/health` },
  { name: 'auth-service', url: `http://localhost:${process.env.PORT_AUTH || 3002}/health` },
  { name: 'funding-service', url: `http://localhost:${process.env.PORT_FUNDING || 3003}/health` },
  { name: 'interaction-service', url: `http://localhost:${process.env.PORT_INTERACTION || 3004}/health` },
  { name: 'payment-service', url: `http://localhost:${process.env.PORT_PAYMENT || 3005}/health` },
  { name: 'public-service', url: `http://localhost:${process.env.PORT_PUBLIC || 3006}/health` },
  { name: 'user-service', url: `http://localhost:${process.env.PORT_USER || 3007}/health` },
];

app.get('/health-checks', async (_req, res) => {
  const results = await Promise.all(
    services.map(async ({ name, url }) => {
      try {
        const start = Date.now();
        const resp = await axios.get(url, { timeout: 2000 });
        return {
          name,
          status: resp.status === 200 ? 'ok' : 'error',
          latency: Date.now() - start,
        };
      } catch (err: unknown) {
        return {
          name,
          status: 'down',
          error: err instanceof Error ? err.message : String(err),
        };
      }
    })
  );

  // overall status is down if any service is down
  const overall = results.every((r) => r.status === 'ok') ? 'ok' : 'degraded';
  res.status(overall === 'ok' ? 200 : 500).json({ overall, services: results });
});

app.get('/', (req, res) => {
  res.send({ message: "Hello I'm api gateway" });
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
