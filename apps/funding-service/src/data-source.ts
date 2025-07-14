import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { fundingEntities } from '@shared/entities';
// dotenv.config({ path: __dirname + '/../../../.env.development' });
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: fundingEntities,
  migrationsRun: false,
  synchronize: false,
  logging: true,
  timezone: '+09:00',
  charset: 'utf8mb4',
});
