import express from 'express';
import cookieParser from 'cookie-parser';
import { AppDataSource } from './data-source';
import authRouter from './routes/auth';
import oauthRouter from './routes/oauth';
import dotenv from 'dotenv';
dotenv.config();

const host = process.env.HOST ?? 'localhost';
const port = process.env.AUTH_SERVICE_PORT ? Number(process.env.AUTH_SERVICE_PORT) : 3000;

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send({ message: "Hello I'm auth service" });
});

app.get('/health', (_req, res) =>
  res.status(200).json({ status: 'ok', service: 'auth-service', timestamp: new Date().toISOString() })
);

app.use(cookieParser());
app.use('/auth', authRouter);
app.use('/oauth', oauthRouter);

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
