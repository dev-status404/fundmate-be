import express from 'express';
import dotenv from 'dotenv';
import healthRouter from './routes/health-route';
import paymentRouter from './routes/payment-route';
import { AppDataSource } from './data-source';
dotenv.config();

const host = process.env.HOST ?? 'localhost';
const port = process.env.PAYMENT_SERVICE_PORT ? Number(process.env.PAYMENT_SERVICE_PORT) : 3000;

const app = express();

app.use('/health', healthRouter);
app.use('/payment', paymentRouter);

AppDataSource.initialize()
  .then(() => {
    console.log('데이터 베이스 연결 성공'); // 추후 정리 코드
    app.listen(port, host, () => {
      console.log(`[ ready ] http://${host}:${port}`);
    });
  })
  .catch((error) => {
    console.error('데이터 베이스 연결 실패:', error);
  });
