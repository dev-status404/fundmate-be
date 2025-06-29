import express from 'express';
import FundingRouter from './routes/FundingRouter';
import OptionRouter from './routes/OptionRouter';
import MainRouter from './routes/MainRouter';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3003;

const app = express();

app.use('/projects', FundingRouter);
app.use('/options', OptionRouter);
app.use('/api/projects', MainRouter);

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', service: 'funding-service', timestamp: new Date().toISOString() }));

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
