import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn({ name: 'category_id', type: 'int' })
  categoryId!: number;

  @Column({ type: 'varchar', length: 45 })
  name!: string;
}
