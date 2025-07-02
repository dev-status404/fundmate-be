import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from './Category';
import { User } from './User';

@Entity('interest_category')
export class InterestCategory {
  @PrimaryGeneratedColumn({ name: 'interest_category_id' })
  interestCategoryId!: number;

  @ManyToOne(() => Category, { nullable: false })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
