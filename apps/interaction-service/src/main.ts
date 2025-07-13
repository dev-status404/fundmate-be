import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import { serviceConfig, headerToLocals } from '@shared/config';
import likeRouter from './routes/likes';

dotenv.config();

const { port, host, url } = serviceConfig['interaction-service'];

const app = express();
app.use(cookieParser());
app.use(headerToLocals);

app.get('/', (req, res) => {
  res.send({ message: "Hello I'm interaction service" });
});

app.get('/health', (_req, res) =>
  res.status(200).json({ status: 'ok', service: 'interaction-service', timestamp: new Date().toISOString() })
);

app.use('/users/likes', likeRouter);

AppDataSource.initialize()
  .then(() => {
    console.log('데이터베이스 연결 성공');
    app.listen(port, host, () => {
      console.log(`[ ready ] ${url}`);
    });
  })
  .catch((error) => {
    console.error('데이터베이스 연결 실패:', error);
  });
