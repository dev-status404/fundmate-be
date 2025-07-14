import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn({ name: 'image_id', type: 'int' })
  imageId!: number;

  @Column({ type: 'varchar', length: 255 })
  url!: string;
}
