import express from 'express';
import { AppDataSource } from './data-source';
import userRouter from './routes/users';
import dotenv from 'dotenv';
import { serviceConfig, headerToLocals } from '@shared/config';
dotenv.config();

const { port, host, url } = serviceConfig['user-service'];

const app = express();

app.use(express.json());
app.use(headerToLocals);

app.get('/', (req, res) => {
  res.send({ message: "Hello I'm user service" });
});

app.get('/health', (_req, res) =>
  res.status(200).json({ status: 'ok', service: 'user-service', timestamp: new Date().toISOString() })
);

app.use('/users', userRouter);

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
