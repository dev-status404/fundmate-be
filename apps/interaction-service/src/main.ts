import express from 'express';
import dotenv from 'dotenv';
import { serviceConfig, headerToLocals } from '@shared/config';
dotenv.config();

const { port, host, url } = serviceConfig['interaction-service'];

const app = express();
app.use(headerToLocals);

app.get('/', (req, res) => {
  res.send({ message: "Hello I'm interaction service" });
});

app.get('/health', (_req, res) =>
  res.status(200).json({ status: 'ok', service: 'interaction-service', timestamp: new Date().toISOString() })
);
const likeRouter = require('./src/routes/likes');
app.use('/users/likes', likeRouter);
app.listen(port, host, () => {
  console.log(`[ ready ] ${url}`);
});
