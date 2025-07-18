import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { healthCheck } from './controllers/health-controller';
import docsRoutes from './routes/docs-route';
import apiRoutes from './routes/api-route';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { httpLogger } from '@shared/logger';
dotenv.config();

const host = process.env.HOST ? process.env.HOST : 'localhost';
const port = process.env.API_GATEWAY_PORT ? Number(process.env.API_GATEWAY_PORT) : 3000;

const app = express();
app.use(cors());
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.options('*', cors());
app.use(express.json());
app.use(httpLogger);
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
  return res.send({ message: "Hello I'm api gateway" });
});

app.get('/health-checks', healthCheck);
app.use('/assets', express.static(path.join(__dirname, 'src/assets')));
app.use('/docs', docsRoutes);
app.use('/', apiRoutes);

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
