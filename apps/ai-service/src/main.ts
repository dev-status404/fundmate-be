import express from 'express';
import cors from 'cors';
import AiChat from './routes/aichat.js';
import { serviceConfig } from '@shared/config';
import dotenv from 'dotenv';
dotenv.config();

const { port, host, url } = serviceConfig['ai-service'];

const app = express();

app.get('/', (req, res) => {
  res.send({ message: "Hello I'm ai service" });
});

app.get('/health', (_req, res) =>
  res.status(200).json({ status: 'ok', service: 'ai-service', timestamp: new Date().toISOString() })
);

app.use(cors());
app.use(express.json());
app.use('/ai', AiChat);

app.listen(port, host, () => {
  console.log(`[ ready ] ${url}`);
});
