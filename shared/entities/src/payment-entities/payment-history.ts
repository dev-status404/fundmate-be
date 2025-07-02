import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * 결제 히스토리 정보
 */
@Entity('payment_histories')
export class PaymentHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @Column({ name: 'schedule_id', type: 'int' })
  scheduleId!: number;

  @Column({ name: 'payment_info_id', type: 'int' })
  paymentInfoId!: number;

  @Column({ name: 'reward_id', type: 'int', nullable: true })
  rewardId?: number;

  @Column({ name: 'project_id', type: 'int' })
  projectId!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ name: 'executed_at', type: 'datetime', nullable: true })
  executedAt?: Date;

  @Column({ type: 'enum', enum: ['success', 'fail', 'cancel'], default: 'success' })
  status!: 'success' | 'fail' | 'cancel';

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ name: 'error_log', type: 'text', nullable: true })
  errorLog?: string;
}
