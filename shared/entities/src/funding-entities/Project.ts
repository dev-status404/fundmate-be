import { Category, Image, OptionData, User, Like } from '@shared/entities';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('project')
export class Project {
  @PrimaryGeneratedColumn({ name: 'project_id', type: 'int' })
  projectId!: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Image, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'image_id' })
  image?: Image;

  @ManyToOne(() => Category, { nullable: false })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @Column({ type: 'varchar', length: 30, nullable: false })
  title!: string;

  @Column({ type: 'text', nullable: false })
  description!: string;

  @Column({ name: 'short_description', type: 'varchar', length: 45, nullable: false })
  shortDescription!: string;

  @Column({ name: 'goal_amount', type: 'int', nullable: false })
  goalAmount!: number;

  @Column({ name: 'current_amount', type: 'int', nullable: false })
  currentAmount!: number;

  @Column({ name: 'start_date', type: 'timestamp', nullable: false })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'timestamp', nullable: false })
  endDate!: Date;

  @Column({ name: 'delivery_date', type: 'timestamp', nullable: false })
  deliveryDate!: Date;

  @Column({ name: 'is_active', type: 'boolean', nullable: false, default: false })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'int', nullable: true, default: 0 })
  gender?: number;

  @Column({ name: 'age_group', type: 'int', nullable: true, default: 0 })
  ageGroup!: number;

  @OneToMany(() => OptionData, (option) => option.project)
  options!: OptionData[];

  @OneToMany(() => Like, (like) => like.project)
  likes!: Like[];
}
