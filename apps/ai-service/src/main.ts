import express from 'express';
import cors from 'cors';
// import dotenv from 'dotenv';
// dotenv.config();

import AiChat from './routes/aichat.js';

// 환경 변수들이 제대로 로드되었는지 여기서 다시 한번 확인해보세요.
console.log('--- Environment Variables Loaded ---');
console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY : 'Not Loaded');
console.log('PEM Path:', process.env.PEM_PATH ? process.env.PEM_PATH : 'Not Loaded');
console.log('RDS Endpoint:', process.env.RDS_ENDPOINT ? process.env.RDS_ENDPOINT : 'Not Loaded');
console.log('EC2 Host:', process.env.EC2_HOST ? process.env.EC2_HOST : 'Not Loaded');
console.log('AI Service Port:', process.env.AI_SERVICE_PORT ? 'Loaded' : 'Not Loaded');
console.log('----------------------------------');

const host = process.env.HOST ?? 'localhost';
const port = process.env.API_GATEWAY_PORT ? Number(process.env.API_GATEWAY_PORT) : 3000;
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
