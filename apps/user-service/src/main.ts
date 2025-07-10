import express from 'express';
import dotenv from 'dotenv';
import { serviceConfig, headerToLocals } from '@shared/config';
dotenv.config();

const { port, host, url } = serviceConfig['user-service'];

const app = express();
app.use(headerToLocals);

app.get('/', (req, res) => {
  res.send({ message: "Hello I'm user service" });
});

app.get('/health', (_req, res) =>
  res.status(200).json({ status: 'ok', service: 'user-service', timestamp: new Date().toISOString() })
);

app.listen(port, host, () => {
  console.log(`[ ready ] ${url}`);
});
