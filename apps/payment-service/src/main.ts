import express from 'express';
import healthRouter from './routes/health-route';
import paymentRouter from './routes/payment-route';
import reservationRouter from './routes/reservation-route';
import statisticsRouter from './routes/statistics-route';
import { AppDataSource } from './data-source';
import { serviceConfig, headerToLocals } from '@shared/config';
import { httpLogger } from '@shared/logger';
import dotenv from 'dotenv';
dotenv.config();

const { port, host, url } = serviceConfig['payment-service'];

const app = express();

app.use(httpLogger);
app.use(express.json());
app.use(headerToLocals);

app.use('/health', healthRouter);
app.use('/payments', paymentRouter);
app.use('/reservations', reservationRouter);
app.use('/statistics', statisticsRouter);

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
