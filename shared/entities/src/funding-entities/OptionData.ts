import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from './Project';

@Entity('option_data')
export class OptionData {
  @PrimaryGeneratedColumn({ name: 'option_id', type: 'int' })
  optionId!: number;

  @ManyToOne(() => Project, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project?: Project;

  @Column({ type: 'varchar', length: 30, nullable: false })
  title!: string;

  @Column({ type: 'varchar', length: 150, nullable: false })
  description!: string;

  @Column({ type: 'int', nullable: false })
  price!: number;
}
