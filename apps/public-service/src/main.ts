import express from 'express';
import dotenv from 'dotenv';
import { serviceConfig, headerToLocals } from '@shared/config';
import { httpLogger } from '@shared/logger';
import PublicDataRouter from './routes/PublicDataRouter';
dotenv.config();

const { port, host, url } = serviceConfig['public-service'];

const app = express();
app.use(httpLogger);
app.use(headerToLocals);
app.use(express.json());

app.use('/datas', PublicDataRouter);

app.get('/health', (_req, res) =>
  res.status(200).json({ status: 'ok', service: 'public-service', timestamp: new Date().toISOString() })
);

app.listen(port, host, () => {
  console.log(`[ ready ] ${url}`);
});
