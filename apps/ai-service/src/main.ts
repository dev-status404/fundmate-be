import express from 'express';
import dotenv from "dotenv";
import cors from "cors";


dotenv.config();

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3001;

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
