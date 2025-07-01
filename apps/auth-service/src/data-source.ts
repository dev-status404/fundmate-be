import { DataSource } from 'typeorm';
import { Image } from './entity/Image';
import { Age } from './entity/Age';
import { User } from './entity/User';
import { Token } from './entity/Token';
import { EmailVerification } from './entity/EmailVerification';
import { Category } from './entity/Category';
import { InterestCategory } from './entity/InterestCategory';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Image, Age, User, Token, EmailVerification, Category, InterestCategory],
  synchronize: true,
  logging: true,
  timezone: '+09:00',
});
