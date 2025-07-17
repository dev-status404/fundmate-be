import express from 'express';
import cors, { CorsOptions } from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import { httpLogger } from '@shared/logger';

import { healthCheck } from './controllers/health-controller';
import docsRoutes from './routes/docs-route';
import apiRoutes from './routes/api-route';
import awsRoutes from './routes/aws-route';
import dotenv from 'dotenv';
dotenv.config();

const host = process.env.HOST ? process.env.HOST : 'localhost';
const port = process.env.API_GATEWAY_PORT ? Number(process.env.API_GATEWAY_PORT) : 3000;

const app = express();

const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:5001',
  'http://localhost:5002',
  'http://localhost:5003',
  'http://localhost:5004',
  'http://localhost:5005',
  'https://www.fundmate.com',
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'set-cookies'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(httpLogger);
app.use(cookieParser());

app.use('/docs', docsRoutes);
app.use('/assets', express.static(path.join(__dirname, 'src/assets')));
app.get('/health-checks', healthCheck);
app.use('/upload', awsRoutes);
app.use('/', apiRoutes);

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
