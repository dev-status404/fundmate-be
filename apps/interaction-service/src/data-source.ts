import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
//import { Like } from '@shared/entities';
//import { User } from '@shared/entities';
//import { Project } from '@shared/entities';
import { interactionEntities } from '@shared/entities';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: interactionEntities,
  synchronize: true,
  logging: true,
  timezone: '+09:00',
});
