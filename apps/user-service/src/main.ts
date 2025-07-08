import express from 'express';
import { AppDataSource } from './data-source';
import userRouter from './routes/users';
import dotenv from 'dotenv';
dotenv.config();

const host = process.env.HOST ?? 'localhost';
const port = process.env.USER_SERVICE_PORT ? Number(process.env.USER_SERVICE_PORT) : 3000;

const app = express();
app.use(express.json());
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
      console.log(`[ ready ] http://${host}:${port}`);
    });
  })
  .catch((error) => {
    console.error('데이터 베이스 연결 실패:', error);
  });
