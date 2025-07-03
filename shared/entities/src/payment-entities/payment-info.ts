import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * 결제 수단 정보
 */
@Entity('payment_info')
export class PaymentInfo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @Column({ name: 'payment_method', type: 'enum', enum: ['bank_transfer', 'card'] })
  paymentMethod!: 'bank_transfer' | 'card';

  @Column({ name: 'display_info', type: 'varchar', length: 255 })
  displayInfo!: string;

  @Column({ type: 'json' })
  details!: any;

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
