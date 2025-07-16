import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { healthCheck } from './controllers/health-controller';
import docsRoutes from './routes/docs-route';
import apiRoutes from './routes/api-route';
import path from 'path';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import { httpLogger } from '@shared/logger';
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
    // origin === undefined when no Origin header (Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'set-cookies'],
  credentials: true,
};

// 3) Apply it
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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
