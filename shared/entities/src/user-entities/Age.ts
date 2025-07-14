import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('age')
export class Age {
  @PrimaryGeneratedColumn({ name: 'age_id', type: 'int' })
  ageId!: number;

  @Column({ type: 'varchar', length: 10 })
  generation!: string;
}
