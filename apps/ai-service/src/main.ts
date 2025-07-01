import express from 'express';
//import dotenv from "dotenv";
import cors from "cors";

//dotenv.config();

import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

const host = process.env.HOST ?? 'localhost';
const port = process.env.AI_SERVICE_PORT ? Number(process.env.AI_SERVICE_PORT) : 3000;

const app = express();

app.get('/', (req, res) => {
  res.send({ message: "Hello I'm ai service" });
});

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', service: 'ai-service', timestamp: new Date().toISOString() }));

const AiChat = require("./src/routes/aichat");

app.use(cors());
app.use(express.json());
app.use("/ai", AiChat);

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
