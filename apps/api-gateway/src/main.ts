import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { healthCheck } from './controllers/health-controller';
import docsRoutes from './routes/docs-route';
import apiRoutes from './routes/api-route';
import path from 'path';
import cookieParser from 'cookie-parser';
import { headerToLocals } from '@shared/config';
dotenv.config();

const host = 'localhost';
const port = process.env.API_GATEWAY_PORT ? Number(process.env.API_GATEWAY_PORT) : 3000;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(headerToLocals);

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
