import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { usersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';

type ProductTestType = {
  id: number;
  name: string;
  price: number;
};

type Options = {
  where?: {
    name?: string;
    price?: number;
    maxPrice?: number;
  };
};

type FindOneParam = { where: { id: number } };

describe('ProductsService', () => {
  let productService: ProductsService;
  let productRepository: Repository<Product>;

  const REPOSITORY_TOKEN = getRepositoryToken(Product);

  const createProductDto: CreateProductDto = {
    name: 'Test Product',
    description: 'This is a test product',
    price: 100,
  };

  let products: ProductTestType[];

  beforeEach(async () => {
    products = [
      { id: 1, name: 'Product 1', price: 10 },
      { id: 2, name: 'Product 2', price: 20 },
      { id: 3, name: 'Product 3', price: 30 },
    ];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: usersService,
          useValue: {
            getCurrentUser: jest.fn((userId: number) =>
              Promise.resolve({ id: userId }),
            ),
          },
        },
        {
          provide: REPOSITORY_TOKEN,
          useValue: {
            create: jest.fn((dto: CreateProductDto) => dto),

            save: jest.fn((dto: CreateProductDto) =>
              Promise.resolve({
                id: 1,
                ...dto,
              }),
            ),

            find: jest.fn((options?: Options) => {
              if (options?.where?.name) {
                return Promise.resolve([products[0], products[1]]);
              }

              return Promise.resolve(products);
            }),
            findOne: jest.fn((param: FindOneParam) => {
              return Promise.resolve(
                products.find((p) => p.id === param.where.id),
              );
            }),
            remove: jest.fn((product: Product) => {
              const index = products.indexOf(product);
              if (index > -1) {
                return Promise.resolve(products.splice(index, 1)[0]);
              }
            }),
          },
        },
      ],
    }).compile();

    productService = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(REPOSITORY_TOKEN);
  });

  it('should be defined', () => {
    expect(productService).toBeDefined();
  });

  it('should have a product repository', () => {
    expect(productRepository).toBeDefined();
  });

  describe('createProduct', () => {
    it('should call "create" to create a new product', async () => {
      await productService.createProduct(createProductDto, 1);

      expect(productRepository.create).toHaveBeenCalled();
      expect(productRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should call "save" to save the new product', async () => {
      await productService.createProduct(createProductDto, 1);

      expect(productRepository.save).toHaveBeenCalled();
      expect(productRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should create a new product and return it', async () => {
      const result = await productService.createProduct(createProductDto, 1);

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Product');
      expect(result.description).toBe('This is a test product');
      expect(result.price).toBe(100);
    });
  });

  describe('getAll', () => {
    it('should call "find" to get products', async () => {
      await productService.getAll();

      expect(productRepository.find).toHaveBeenCalled();
      expect(productRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return two products when searching by name', async () => {
      const result = await productService.getAll('book');

      expect(result).toHaveLength(2);
    });

    it('should return all products when no filter is provided', async () => {
      const result = await productService.getAll();

      expect(result).toHaveLength(3);
    });
  });

  describe('getOneBy', () => {
    it('should call "findOne" to get a product by id', async () => {
      await productService.getOneBy(1);
      expect(productRepository.findOne).toHaveBeenCalled();
      expect(productRepository.findOne).toHaveBeenCalledTimes(1);
    });
    it('should return a product with the given id', async () => {
      const product = await productService.getOneBy(1);
      expect(product).toMatchObject(products[0]);
    });
    it('should throw NotFoundException if product with the given id does not exist', async () => {
      expect.assertions(1);
      try {
        await productService.getOneBy(999);
      } catch (e) {
        expect(e).toMatchObject({
          status: 404,
          message: 'Product with id 999 not found',
        });
      }
    });
  });

  describe('update', () => {
    const title = 'Updated Product';
    it("should call'save' method in the repository to update the product", async () => {
      const result = await productService.update(1, { name: title });
      expect(productRepository.save).toHaveBeenCalled();
      expect(productRepository.save).toHaveBeenCalledTimes(1);
      expect(result.name).toBe(title);
    });
    it('should throw NotFoundException if product with the given id does not exist', async () => {
      expect.assertions(1);
      try {
        await productService.update(999, { name: title });
      } catch (e) {
        expect(e).toMatchObject({
          status: 404,
          message: 'Product with id 999 not found',
        });
      }
    });
  });

  describe('delete', () => {
    it("should call 'remove' method in the repository to delete the product", async () => {
      const result = await productService.delete(1);
      expect(productRepository.remove).toHaveBeenCalled();
      expect(productRepository.remove).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject({
        message: 'Product with id 1 has been deleted',
      });
    });

    it('should remove the product and return seccus message', async () => {
      const result = await productService.delete(1);
      expect(result).toMatchObject({
        message: 'Product with id 1 has been deleted',
      });
      const remainingProducts = await productService.getAll();
      expect(remainingProducts).toHaveLength(2);
    });

    it('should throw NotFoundException if product with the given id does not exist', async () => {
      expect.assertions(1);
      try {
        await productService.delete(999);
      } catch (e) {
        expect(e).toMatchObject({
          status: 404,
          message: 'Product with id 999 not found',
        });
      }
    });
  });
});
