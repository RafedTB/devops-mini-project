import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { User } from '../src/users/user.entity';
import { Product } from '../src/products/product.entity';
import { Order } from '../src/orders/order.entity';
import { OrderItem } from '../src/orders/order-item.entity';
import { UserType } from '../src/utils/enum';
import { MailService } from '../src/mail/mail.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import * as bcrypt from 'bcryptjs';

describe('OrdersController (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let accessToken: string;
    let testUser: User;
    let testProduct: Product;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideGuard(ThrottlerGuard)
            .useValue({ canActivate: () => true })
            .overrideProvider(MailService)
            .useValue({
                sendVerificationMail: jest.fn(),
                sendResetPassword: jest.fn(),
                sendLoginMail: jest.fn(),
            })
            .compile();

        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
        await app.init();
        dataSource = app.get(DataSource);
    });

    beforeEach(async () => {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('password123', salt);

        const userResult = await dataSource
            .createQueryBuilder()
            .insert()
            .into(User)
            .values({
                username: 'orderclient',
                email: 'client@orders.com',
                password: hash,
                userType: UserType.USER,
                isAccountVerified: true,
            })
            .execute();
        testUser = userResult.generatedMaps[0] as User;

        const productResult = await dataSource
            .createQueryBuilder()
            .insert()
            .into(Product)
            .values({
                name: 'Gaming Mouse',
                description: 'Fast optical sensor mouse',
                price: 50.0,
            })
            .execute();
        testProduct = productResult.generatedMaps[0] as Product;

        const loginRes = await request(app.getHttpServer())
            .post('/api/users/auth/login')
            .send({ email: 'client@orders.com', password: 'password123' });

        accessToken = loginRes.body.accessToken;
    });

    afterEach(async () => {
        await dataSource.createQueryBuilder().delete().from(OrderItem).execute();
        await dataSource.createQueryBuilder().delete().from(Order).execute();
        await dataSource.createQueryBuilder().delete().from(Product).execute();
        await dataSource.createQueryBuilder().delete().from(User).execute();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/orders', () => {
        it('should return empty list (200) for client with no orders', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/orders')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(0);
        });

        it('should return 401 without auth token', async () => {
            const res = await request(app.getHttpServer()).get('/api/orders');
            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/orders', () => {
        it('should create an order with delivery details and return 201', async () => {
            const orderPayload = {
                fullName: 'John Doe',
                address: '123 Main St, Apt 4B',
                city: 'New York',
                postalCode: '10001',
                phone: '+1 555-123-4567',
                items: [{ productId: testProduct.id, quantity: 2 }],
            };

            const postRes = await request(app.getHttpServer())
                .post('/api/orders')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(orderPayload);

            expect(postRes.status).toBe(201);
            expect(postRes.body).toHaveProperty('id');
            expect(postRes.body.fullName).toBe('John Doe');
            expect(postRes.body.address).toBe('123 Main St, Apt 4B');
            expect(postRes.body.city).toBe('New York');
            expect(postRes.body.postalCode).toBe('10001');
            expect(postRes.body.phone).toBe('+1 555-123-4567');
            expect(postRes.body.totalPrice).toBe(100.0);
            expect(postRes.body.items.length).toBe(1);
            expect(postRes.body.items[0].productName).toBe('Gaming Mouse');
            expect(postRes.body.items[0].quantity).toBe(2);

            // Now verify GET /api/orders returns the saved order
            const getRes = await request(app.getHttpServer())
                .get('/api/orders')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(getRes.status).toBe(200);
            expect(getRes.body.length).toBe(1);
            expect(getRes.body[0].id).toBe(postRes.body.id);
        });

        it('should return 400 if required delivery fields are missing', async () => {
            const invalidPayload = {
                items: [{ productId: testProduct.id, quantity: 1 }],
            };

            const res = await request(app.getHttpServer())
                .post('/api/orders')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(invalidPayload);

            expect(res.status).toBe(400);
        });

        it('should return 400 if items array is empty', async () => {
            const emptyItemsPayload = {
                fullName: 'John Doe',
                address: '123 Main St',
                city: 'New York',
                postalCode: '10001',
                phone: '+1 555-123-4567',
                items: [],
            };

            const res = await request(app.getHttpServer())
                .post('/api/orders')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(emptyItemsPayload);

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/orders/:id', () => {
        it('should return order details by id', async () => {
            const orderPayload = {
                fullName: 'John Doe',
                address: '123 Main St',
                city: 'New York',
                postalCode: '10001',
                phone: '+1 555-123-4567',
                items: [{ productId: testProduct.id, quantity: 1 }],
            };

            const created = await request(app.getHttpServer())
                .post('/api/orders')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(orderPayload);

            const orderId = created.body.id;

            const res = await request(app.getHttpServer())
                .get(`/api/orders/${orderId}`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(orderId);
            expect(res.body.fullName).toBe('John Doe');
        });

        it('should return 404 for non-existent order', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/orders/99999')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(404);
        });
    });
});

