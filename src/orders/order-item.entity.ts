import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';

@Entity({ name: 'order_items' })
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order!: Order;

  @ManyToOne(() => Product, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  product!: Product | null;

  @Column({ type: 'varchar', length: 100 })
  productName!: string;

  @Column({ type: 'float' })
  productPrice!: number;

  @Column({ type: 'int', default: 1 })
  quantity!: number;
}
