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
import { PaymentHistory } from './payment-entities';
import { PaymentSchedule } from './payment-entities';
import { PaymentInfo } from './payment-entities';

export { Age, Category, EmailVerification, Image, InterestCategory, Token, User, Follow };
export { Project, OptionData };
export { PaymentHistory, PaymentSchedule, PaymentInfo };
export { Like, Comment };

export const authEntities = [Age, Category, EmailVerification, Image, InterestCategory, Token, User];
export const fundingEntities = [Project, OptionData, User, Image, Category, Like, Comment, ...authEntities, PaymentSchedule, PaymentInfo];
export const userEntities = [Age, Category, Image, InterestCategory, User, Follow, Token];
export const interactionEntities = [User, Project, Like, Age, Image, Category, OptionData, Comment, PaymentSchedule, PaymentInfo];
export const paymentEntities = [PaymentHistory, PaymentSchedule, PaymentInfo, ...fundingEntities];