import { Age } from './user-entities/Age';
import { Category } from './auth-entities/Category';
import { EmailVerification } from './auth-entities/EmailVerification';
import { Image } from './user-entities/Image';
import { InterestCategory } from './auth-entities/InterestCategory';
import { Token } from './auth-entities/Token';
import { User } from './auth-entities/User';
import { Follow } from './user-entities/Follow';
import { Project } from './funding-entities/Project';
import { OptionData } from './funding-entities/OptionData';
import { Like } from './interaction-entities/Like';
import { Comment } from './interaction-entities/Comment';

export { Age, Category, EmailVerification, Image, InterestCategory, Token, User, Follow };
export { Project, OptionData };
export * from './payment-entities';
export { Like, Comment };

export const authEntities = [Age, Category, EmailVerification, Image, InterestCategory, Token, User];
export const fundingEntities = [Project, OptionData, User, Image, Category, Like, Comment, ...authEntities];
export const userEntities = [Age, Category, Image, InterestCategory, User, Follow, Token];
export const interactionEntities = [User, Project, Like, Age, Image, Category, OptionData, Comment];
