import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OptionData } from './funding-entities/OptionData';
import { Project } from './funding-entities/Project';
import * as Types from '@shared/types';


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

  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 30,
    default: 'UNKNOWN',
    nullable:false
  })
  paymentMethod!: string;

  @Column({ name: 'bank_code', type: 'varchar', length: 30, nullable: true })
  bankCode?: string;

  @Column({ name: 'display_info', type: 'varchar', length: 255, nullable: true })
  displayInfo?: string;

  @Column({ name: 'reward_id', type: 'int', nullable: true })
  rewardId?: number;

  @ManyToOne(() => Project, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'project_id' })
  project?: Project;
  
  @Column({ name: 'project_id', type: 'int', nullable: true })
  projectId?: number;

  @Column({ name: 'option_title', type: 'varchar', length: 255, nullable: true })
  optionTitle?: string;

  @Column({ name: 'option_amount', type: 'int', nullable: true })
  optionAmount?: number;

  @Column({ name: 'project_title', type: 'varchar', length: 255, nullable: true })
  projectTitle!: string;

  @Column({ name: 'project_image', type: 'varchar', length: 255, nullable: true })
  projectImage!: string;

  @Column({ name: 'amount', type: 'int' })
  amount!: number;

  @Column({ name: 'donate_amount', type: 'int', nullable: true })
  donateAmount?: number;

  @Column({ name: 'total_amount', type: 'int' })
  totalAmount!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  @Column({ name: 'address_number', type: 'int', nullable: true })
  addressNumber?: number;

  @Column({ name: 'address_info', type: 'varchar', length: 255, nullable: true })
  addressInfo?: string;

  @Column({ name: 'executed_at', type: 'datetime', nullable: true })
  executedAt?: Date;

  @Column({ type: 'enum', enum: ['success', 'fail', 'cancel'], default: 'success' })
  status!: 'success' | 'fail' | 'cancel';

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ name: 'error_log', type: 'text', nullable: true })
  errorLog?: string;
}

@Entity('payment_info')
export class PaymentInfo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @Column({ name: 'payment_method', type: 'enum', enum: Types.PaymentMethod })
  method!: Types.PaymentMethod;

  @Column({
    name: 'bankCode',
    type: 'enum',
    enum: Types.BankCode,
  })
  code!: Types.BankCode;

  @Column({ name: 'display_info', type: 'varchar', length: 255 })
  displayInfo!: string;

  @Column({ type: 'json' })
  details!: Types.Extra;

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}

@Entity('payment_schedule')
export class PaymentSchedule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @ManyToOne(() => OptionData, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reward_id' })
  option?: OptionData;

  @ManyToOne(() => PaymentInfo, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'payment_info_id' })
  paymentInfo!: PaymentInfo;

  @ManyToOne(() => Project, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @Column({ name: 'amount', type: 'int' })
  amount!: number;

  @Column({ name: 'donate_amount', type: 'int', nullable: true })
  donateAmount?: number;

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

export const paymentEntities = [PaymentHistory, PaymentInfo, PaymentSchedule];
