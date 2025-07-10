import { Age } from './auth-entities/Age';
import { Category } from './auth-entities/Category';
import { EmailVerification } from './auth-entities/EmailVerification';
import { Image } from './auth-entities/Image';
import { InterestCategory } from './auth-entities/InterestCategory';
import { Token } from './auth-entities/Token';
import { User } from './auth-entities/User';
import { Like } from './interaction-entities/Like';

export const authEntities = [Age, Category, EmailVerification, Image, InterestCategory, Token, User];

export * from './payment-entities';

import { Project } from './funding-entities/Project';
import { OptionData } from './funding-entities/OptionData';
export { Project, OptionData };

export const fundingEntities = [Project, OptionData, User, Image, Category, Like, ...authEntities];

export { Like };
