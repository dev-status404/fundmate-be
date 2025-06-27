import express from 'express';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3001;

const app = express();

app.get('/', (req, res) => {
  res.send({ message: "Hello I'm ai service" });
});

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', service: 'ai-service', timestamp: new Date().toISOString() }));

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
