import express from 'express';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

const host = process.env.HOST ?? 'localhost';
const port = process.env.PAYMENT_SERVICE_PORT ? Number(process.env.PAYMENT_SERVICE_PORT) : 3000;

const app = express();
app.get('/', (req, res) => {
  res.send({ message: "Hello I'm payment service" });
});

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', service: 'payment-service', timestamp: new Date().toISOString() }));

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
