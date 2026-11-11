import {Test,TestingModule} from '@nestjs/testing';
import {DataSource} from 'typeorm';
import {INestApplication} from '@nestjs/common';
import request from 'supertest';
import {AppModule} from '../src/app.module';
import {Product} from "../src/products/product.entity";
import { CreateProductDto } from '../src/products/dto/create-product.dto';
import { User } from '../src/users/user.entity';
import { UserType } from '../src/utils/enum';
import { ThrottlerGuard } from '@nestjs/throttler';
import * as bcrypt from 'bcryptjs';


describe('ProductsController (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let productToSave: CreateProductDto[];
    beforeAll(async () => {
        productToSave = [
            {
                name: "Product 1",
                description: "Description for Product 1",
                price: 10.99
            },
            {
                name: "Product 2",
                description: "Description for Product 2",
                price: 20.99
            },
            {
                name: "Product 3",
                description: "Description for Product 3",
                price: 30.99
            },
            {
                name: "Product 4",
                description: "Description for Product 4",
                price: 40.99
            }
        ];
        const module:TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        })
            .overrideGuard(ThrottlerGuard)
            .useValue({ canActivate: () => true })
            .compile();

        app=module.createNestApplication();
        await app.init();
        dataSource=app.get(DataSource);

        //sabving new user (admin) to the database
        const salt = await bcrypt.genSalt(10);
        const hash=await bcrypt.hash("admin123",salt);
        await dataSource.createQueryBuilder().insert().into(User).values({ username: "admin" ,email: "admin@example.com", password: hash,userType:UserType.ADMIN,isAccountVerified:true }).execute();
    });
    afterEach(async () => {
        await dataSource.createQueryBuilder().delete().from(Product).execute();
    });

    afterAll(async () => {
        await dataSource.createQueryBuilder().delete().from(User).execute();
        await app.close();
    });



    //get api/products
    describe('GET /api/products', () => {
        it('should return all products', async () => {
            // Save products to the database
            await dataSource.createQueryBuilder().insert().into(Product).values(productToSave).execute();
            const response = await request(app.getHttpServer()).get('/api/products');
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(productToSave.length);

        })
        it("should return products based on name",async()=>{
            await dataSource.createQueryBuilder().insert().into(Product).values(productToSave).execute();
            const response = await request(app.getHttpServer()).get('/api/products?name=Product 1');
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].name).toBe("Product 1");
        })
        it("should return products based on minPrice and maxPrice",async()=>{
            await dataSource.createQueryBuilder().insert().into(Product).values(productToSave).execute();
            const response = await request(app.getHttpServer()).get('/api/products?minPrice=15&maxPrice=35');
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(2);
        })
    })
});