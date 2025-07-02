import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * 결제 스케줄 정보
 */
@Entity('payment_schedule')
export class PaymentSchedule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @Column({ name: 'reward_id', type: 'int', nullable: true })
  rewardId?: number;

  @Column({ name: 'payment_info_id', type: 'int' })
  paymentInfoId!: number;

  @Column({ name: 'project_id', type: 'int' })
  projectId!: number;

  @Column({ name: 'extra_amount', type: 'int', nullable: true })
  extraAmount?: number;

  @Column({ name: 'total_amount', type: 'int' })
  totalAmount!: number;

  @Column({ name: 'schedule_date', type: 'datetime' })
  scheduleDate!: Date;

  @Column({ type: 'boolean', default: false })
  executed!: boolean;

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  @Column({ name: 'address_number', type: 'int', nullable: true })
  addressNumber?: number;

  @Column({ name: 'address_info', type: 'varchar', length: 255, nullable: true })
  addressInfo?: string;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount!: number;

  @Column({ name: 'last_error_message', type: 'text', nullable: true })
  lastErrorMessage?: string;
}
