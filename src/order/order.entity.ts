import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class OrderHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  orderHistoryId: string;

  @Column()
  orderId: string;

  @Column()
  customerId: string;

  @Column()
  productId: string;

  @Column()
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;
}
