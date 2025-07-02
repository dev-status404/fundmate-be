import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn({ name: 'category_id', type: 'int' })
  categoryId!: number;

  @Column({ name: 'category_name', type: 'varchar', length: 45 })
  name!: string;
}
