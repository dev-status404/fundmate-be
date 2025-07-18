import express from 'express';
import cors from 'cors';
import AiChat from './routes/aichat.js';
import { serviceConfig, headerToLocals } from '@shared/config';
import { httpLogger } from '@shared/logger';
import dotenv from 'dotenv';
dotenv.config();

const { port, host, url } = serviceConfig['ai-service'];

const app = express();
app.use(httpLogger);
app.use(headerToLocals);

app.get('/health', (_req, res) =>
  res.status(200).json({ status: 'ok', service: 'ai-service', timestamp: new Date().toISOString() })
);

app.use(cors());
app.use(express.json());
app.use('/ai', AiChat);

app.listen(port, host, () => {
  console.log(`[ ready ] ${url}`);
});
