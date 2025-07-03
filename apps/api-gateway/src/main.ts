import express from 'express';
import dotenv from 'dotenv';
import { healthCheck } from './controllers/health-controller';
import docsRoutes from './routes/docs-routes';
import apiRoutes from './routes/api-routes';

dotenv.config({ path: '.env.development' });

const host = process.env.HOST ?? 'localhost';
const port = process.env.API_GATEWAY_PORT ? Number(process.env.API_GATEWAY_PORT) : 3000;

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send({ message: "Hello I'm api gateway" });
});

app.get('/health-checks', healthCheck);

app.use('/docs', docsRoutes);
app.use('/', apiRoutes);

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
