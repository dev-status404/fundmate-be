import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: '.env.development' });
import axios from 'axios';
import swaggerUi from 'swagger-ui-express';

const host = process.env.HOST ?? 'localhost';
const port = process.env.API_GATEWAY_PORT ? Number(process.env.API_GATEWAY_PORT) : 3000;

const app = express();

// docs
const assetsPath = path.join(__dirname, '..', '..', '..', 'src', 'assets');
app.use('/assets', express.static(assetsPath));

app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(null, {
    explorer: true,
    swaggerOptions: {
      urls: [
        { name: 'Auth Service', url: '/assets/auths.json' },
        { name: 'User Service', url: '/assets/users.json' },
        { name: 'Public Service', url: '/assets/public.json' },
        { name: 'Fundings Service', url: '/assets/funding.json' },
        { name: 'AI Service', url: '/assets/ai.json' },
        { name: 'Payment Service', url: '/assets/payments.json' },
        { name: 'Interaction Service', url: '/assets/interactions.json' },
        { name: 'payment Service', url: '/assets/payments.json' },
      ],
    },
  })
);

// health check endpoint
const isDocker = process.env.NODE_ENV === 'docker';
const getServiceUrl = (serviceName: string, port: string | number) => `http://${isDocker ? serviceName : 'localhost'}:${port}/health`;
const services = [
  { name: 'ai-service', url: getServiceUrl('ai-service', process.env.AI_SERVICE_PORT || 3001) },
  { name: 'auth-service', url: getServiceUrl('auth-service', process.env.AUTH_SERVICE_PORT || 3002) },
  { name: 'funding-service', url: getServiceUrl('funding-service', process.env.FUNDING_SERVICE_PORT || 3003) },
  { name: 'interaction-service', url: getServiceUrl('interaction-service', process.env.INTERACTION_SERVICE_PORT || 3004) },
  { name: 'payment-service', url: getServiceUrl('payment-service', process.env.PAYMENT_SERVICE_PORT || 3005) },
  { name: 'public-service', url: getServiceUrl('public-service', process.env.PUBLIC_SERVICE_PORT || 3006) },
  { name: 'user-service', url: getServiceUrl('user-service', process.env.USER_SERVICE_PORT || 3007) },
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

  const overall = results.every((r) => r.status === 'ok') ? 'ok' : 'degraded';
  res.status(overall === 'ok' ? 200 : 500).json({ overall, services: results });
});

app.get('/', (req, res) => {
  res.send({ message: "Hello I'm api gateway" });
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
