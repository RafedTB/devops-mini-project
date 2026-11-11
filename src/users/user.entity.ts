import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CURRENT_TIMESTAMP } from '../utils/constants';
import { Product } from '../products/product.entity';
import { Review } from '../reviews/review.entity';
import { UserType } from '../utils/enum';
import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  username!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  email!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column({ type: 'enum', enum: UserType, default: UserType.USER })
  userType!: UserType;

  @Column({ type: 'boolean', default: false })
  isAccountVerified!: boolean;

  @Column({ type: 'varchar', nullable: true })
  verificationToken?: string | null;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken?: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  profileImage?: string | null;

  @OneToMany(() => Product, (product) => product.user)
  products!: Product[];

  @OneToMany(() => Review, (review) => review.user)
  reviews!: Review[];
}
