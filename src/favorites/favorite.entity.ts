import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { CURRENT_TIMESTAMP } from '../utils/constants';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'favorites' })
@Unique(['user', 'product'])
export class Favorite {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
  user!: User;

  @ManyToOne(() => Product, { onDelete: 'CASCADE', eager: true })
  product!: Product;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt!: Date;
}
