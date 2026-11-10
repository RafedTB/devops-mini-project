import { DataSource, DataSourceOptions } from 'typeorm';
import { Product } from '../src/products/product.entity';
import { User } from '../src/users/user.entity';
import { Review } from '../src/reviews/review.entity';
import { Favorite } from '../src/favorites/favorite.entity';
import { Order } from '../src/orders/order.entity';
import { OrderItem } from '../src/orders/order-item.entity';

import { config } from 'dotenv';

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile =
  nodeEnv !== 'production' ? `.env.${nodeEnv}` : '.env';

config({ path: envFile });

export const dataSourceOptions: DataSourceOptions = process.env.DATABASE_URL
  ? {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      entities: [Product, User, Review, Favorite, Order, OrderItem],
      migrations: ['dist/db/migrations/*.js'],
    }
  : {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'admin',
      database: process.env.DATABASE || 'nestlearn',
      synchronize: process.env.NODE_ENV !== 'production',
      entities: [Product, User, Review, Favorite, Order, OrderItem],
      migrations: ['dist/db/migrations/*.js'],
    };

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
