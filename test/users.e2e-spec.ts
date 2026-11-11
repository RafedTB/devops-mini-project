import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { User } from '../src/users/user.entity';
import { Product } from '../src/products/product.entity';
import { Review } from '../src/reviews/review.entity';
import { UserType } from '../src/utils/enum';
import { MailService } from '../src/mail/mail.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import * as bcrypt from 'bcryptjs';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const testUser = {
    email: 'testuser@example.com',
    password: 'password123',
    username: 'testuser',
  };

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
    await app.init();
    dataSource = app.get(DataSource);
  });

  afterEach(async () => {
    await dataSource.createQueryBuilder().delete().from(Review).execute();
    await dataSource.createQueryBuilder().delete().from(Product).execute();
    await dataSource.createQueryBuilder().delete().from(User).execute();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/users/auth/register', () => {
    it('should register a new user and return a verification message', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/users/auth/login', () => {
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(testUser.password, salt);
      await dataSource
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: testUser.username,
          email: testUser.email,
          password: hash,
          userType: UserType.USER,
          isAccountVerified: true,
        })
        .execute();
    });

    it('should login with valid credentials and return accessToken', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(typeof response.body.accessToken).toBe('string');
    });

    it('should return 400 with wrong password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/users/current-user', () => {
    let accessToken: string;

    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(testUser.password, salt);
      await dataSource
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: testUser.username,
          email: testUser.email,
          password: hash,
          userType: UserType.USER,
          isAccountVerified: true,
        })
        .execute();

      const loginResponse = await request(app.getHttpServer())
        .post('/api/users/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      accessToken = loginResponse.body.accessToken;
    });

    it('should return the current user with a valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/current-user')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('username', testUser.username);
    });

    it('should return 401 without a token', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/users/current-user',
      );

      expect(response.status).toBe(401);
    });
  });
});
