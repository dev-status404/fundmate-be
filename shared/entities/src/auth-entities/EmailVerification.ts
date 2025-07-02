import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('email_verification')
export class EmailVerification {
  @PrimaryGeneratedColumn({ name: 'verification_id', type: 'int' })
  verificationId!: number;

  @Column({ type: 'varchar', length: 100 })
  email!: string;

  @Column({ type: 'varchar', length: 10 })
  code!: string;

  @Column({ name: 'is_used', type: 'boolean', default: false })
  isUsed!: boolean;

  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt!: Date;
}
