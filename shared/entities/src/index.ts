import { Age } from './auth-entities/Age';
import { Category } from './auth-entities/Category';
import { EmailVerification } from './auth-entities/EmailVerification';
import { Image } from './auth-entities/Image';
import { InterestCategory } from './auth-entities/InterestCategory';
import { Token } from './auth-entities/Token';
import { User } from './auth-entities/User';
export { Age, Category, EmailVerification, Image, InterestCategory, Token, User };

export const authEntities = [Age, Category, EmailVerification, Image, InterestCategory, Token, User];

import { PaymentHistory } from './payment-entities/payment-history';
import { PaymentInfo } from './payment-entities/payment-info';
import { PaymentSchedule } from './payment-entities/payment-schedule';

export const paymentEntities = [PaymentHistory, PaymentInfo, PaymentSchedule];

import { Project } from './funding-entities/Project';
import { OptionData } from './funding-entities/OptionData';
export { Project, OptionData };

export const fundingEntities = [Project, OptionData];
