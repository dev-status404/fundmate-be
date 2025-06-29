import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Age } from './Age';
import { Image } from './Image';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id', type: 'int' })
  userId!: number;

  @ManyToOne(() => Age, { nullable: true })
  @JoinColumn({ name: 'age_id' })
  age?: Age;

  @ManyToOne(() => Image, { nullable: true })
  @JoinColumn({ name: 'image_id' })
  image?: Image;

  @Column({ type: 'varchar', length: 45, default: '홍길동' })
  nickname!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  salt?: string;

  @Column({ type: 'text', nullable: true })
  contents?: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  gender?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  provider?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  snsId?: string;
}
