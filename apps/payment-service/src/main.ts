import express from 'express';
import dotenv from 'dotenv';
import healthRouter from './routes/health-route';
import paymentRouter from './routes/payment-route';
import methodRouter from './routes/method-route';
import reservationRouter from './routes/reservation-route';
import { AppDataSource } from './data-source';
import { serviceConfig } from '@shared/config';
dotenv.config();

const { port, host, url } = serviceConfig['payment-service'];

const app = express();

app.use('/health', healthRouter);
app.use('/payments', paymentRouter); // <- 다른 서버 연결 예제입니다!
app.use('/payment-methods', methodRouter);
app.use('/reservations', reservationRouter);

AppDataSource.initialize()
  .then(() => {
    console.log('데이터 베이스 연결 성공'); // 추후 정리 코드
    app.listen(port, host, () => {
      console.log(`[ ready ] ${url}`);
    });
  })
  .catch((error) => {
    console.error('데이터 베이스 연결 실패:', error);
  });
