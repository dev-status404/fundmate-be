import { DataSource } from 'typeorm';
import { authEntities } from '@shared/entities';
import dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: authEntities,
  migrationsRun: false,
  synchronize: false,
  logging: true,
  timezone: '+09:00',
  charset: 'utf8mb4',
});
