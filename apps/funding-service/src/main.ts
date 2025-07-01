import express from 'express';
import FundingRouter from './routes/FundingRouter';
import OptionRouter from './routes/OptionRouter';
import MainRouter from './routes/MainRouter';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

const host = process.env.HOST ?? 'localhost';
const port = process.env.FUNDING_SERVICE_PORT ? Number(process.env.FUNDING_SERVICE_PORT) : 3000;

const app = express();

app.use('/projects', FundingRouter);
app.use('/options', OptionRouter);
app.use('/api/projects', MainRouter);

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', service: 'funding-service', timestamp: new Date().toISOString() }));

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
