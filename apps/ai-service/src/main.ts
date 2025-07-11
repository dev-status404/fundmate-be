import express from 'express';
import cors from 'cors';
import AiChat from './routes/aichat.js';

import dotenv from 'dotenv';
dotenv.config();

const host = process.env.HOST ?? 'localhost';
const port = process.env.AI_SERVICE_PORT ? Number(process.env.AI_SERVICE_PORT) : 3000;

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
  console.log(`[ ready ] http://${host}:${port}`);
});
