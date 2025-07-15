import express from 'express';
import cookieParser from 'cookie-parser';
import FundingRouter from './routes/FundingRouter';
import OptionRouter from './routes/OptionRouter';
import MainRouter from './routes/MainRouter';
import { AppDataSource } from './data-source';
import dotenv from 'dotenv';
import { serviceConfig, headerToLocals } from '@shared/config';
import { httpLogger } from '@shared/logger';
import ProfileRouter from './routes/ProfileRouter';

dotenv.config();

const { port, host, url } = serviceConfig['funding-service'];

const app = express();
app.use(httpLogger);
app.use(cookieParser());
app.use(express.json());
app.use(headerToLocals);

app.use('/projects', FundingRouter);
app.use('/options', OptionRouter);
app.use('/api/projects', MainRouter);
app.use('/profiles', ProfileRouter);

app.get('/health', (_req, res) =>
  res.status(200).json({ status: 'ok', service: 'funding-service', timestamp: new Date().toISOString() })
);

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
