import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FavoritesModule } from './favorites/favorites.module';
import { OrdersModule } from './orders/orders.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products/product.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Review } from './reviews/review.entity';
import { User } from './users/user.entity';
import { Favorite } from './favorites/favorite.entity';
import { Order } from './orders/order.entity';
import { OrderItem } from './orders/order-item.entity';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UploadsModule } from './uploads/uploads.module';
import { MailModule } from './mail/mail.module';
import { LoogerMiddleware } from './utils/middlewares/logger.middleware';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV !== 'production'
          ? `.env.${process.env.NODE_ENV || 'development'}`
          : '.env',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 20,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 100,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 300,
      },
    ]),
    ProductsModule,
    UsersModule,
    ReviewsModule,
    FavoritesModule,
    OrdersModule,
    UploadsModule,
    MailModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DATABASE_URL');
        if (dbUrl) {
          return {
            type: 'postgres',
            url: dbUrl,
            ssl: { rejectUnauthorized: false },
            synchronize: process.env.NODE_ENV !== 'production',
            entities: [Product, User, Review, Favorite, Order, OrderItem],
            migrations: ['dist/db/migrations/*.js'],
          };
        }
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', 'admin'),
          database: configService.get<string>('DATABASE', 'nestlearn'),
          synchronize: process.env.NODE_ENV !== 'production',
          entities: [Product, User, Review, Favorite, Order, OrderItem],
          migrations: ['dist/db/migrations/*.js'],
        };
      },
    }),
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoogerMiddleware)
      .forRoutes({ path: 'api/products', method: RequestMethod.GET });
  }
}
