import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { ProductsService } from '../products/products.service';
import { usersService } from '../users/users.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UserType } from '../utils/enum';

describe('OrdersService', () => {
  let service: OrdersService;
  let mockOrderRepository: any;
  let mockOrderItemRepository: any;
  let mockProductsService: any;
  let mockUsersService: any;

  const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
  const mockProduct1 = { id: 10, name: 'Wireless Mouse', price: 25.5 };
  const mockProduct2 = { id: 20, name: 'Mechanical Keyboard', price: 75.0 };

  const mockOrderItem1 = {
    id: 1,
    product: mockProduct1,
    productName: 'Wireless Mouse',
    productPrice: 25.5,
    quantity: 2,
  };

  const mockOrder = {
    id: 100,
    user: mockUser,
    fullName: 'John Doe',
    address: '123 Test St',
    city: 'Metropolis',
    postalCode: '12345',
    phone: '+123456789',
    totalPrice: 126.0,
    status: 'confirmed',
    items: [mockOrderItem1],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockOrderRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest
        .fn()
        .mockImplementation((order) => Promise.resolve({ id: 100, ...order })),
    };

    mockOrderItemRepository = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((item) => Promise.resolve(item)),
    };

    mockProductsService = {
      getOneBy: jest.fn(),
    };

    mockUsersService = {
      getCurrentUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockOrderItemRepository,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: usersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should calculate total and save order with delivery fields and items', async () => {
      mockUsersService.getCurrentUser.mockResolvedValue(mockUser);
      mockProductsService.getOneBy.mockImplementation((id: number) => {
        if (id === 10) return Promise.resolve(mockProduct1);
        if (id === 20) return Promise.resolve(mockProduct2);
        return Promise.resolve(null);
      });

      const dto = {
        fullName: 'John Doe',
        address: '123 Test St',
        city: 'Metropolis',
        postalCode: '12345',
        phone: '+123456789',
        items: [
          { productId: 10, quantity: 2 }, // 25.5 * 2 = 51.0
          { productId: 20, quantity: 1 }, // 75.0 * 1 = 75.0 -> total = 126.0
        ],
      };

      const result = await service.createOrder(1, dto);
      expect(result).toHaveProperty('id', 100);
      expect(result.totalPrice).toBe(126);
      expect(result.fullName).toBe('John Doe');
      expect(result.address).toBe('123 Test St');
      expect(result.items.length).toBe(2);
      expect(mockOrderRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockUsersService.getCurrentUser.mockResolvedValue(mockUser);
      mockProductsService.getOneBy.mockResolvedValue(null);

      const dto = {
        fullName: 'John Doe',
        address: '123 Test St',
        city: 'Metropolis',
        postalCode: '12345',
        phone: '+123456789',
        items: [{ productId: 999, quantity: 1 }],
      };

      await expect(service.createOrder(1, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if items array is empty', async () => {
      mockUsersService.getCurrentUser.mockResolvedValue(mockUser);

      const dto = {
        fullName: 'John Doe',
        address: '123 Test St',
        city: 'Metropolis',
        postalCode: '12345',
        phone: '+123456789',
        items: [],
      };

      await expect(service.createOrder(1, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getUserOrders', () => {
    it('should return list of user orders', async () => {
      mockOrderRepository.find.mockResolvedValue([mockOrder]);
      const orders = await service.getUserOrders(1);
      expect(orders).toEqual([mockOrder]);
      expect(mockOrderRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('getOrderById', () => {
    it('should return order if user owns it', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      const order = await service.getOrderById(100, 1, UserType.USER);
      expect(order).toEqual(mockOrder);
    });

    it('should return order if requested by admin', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      const order = await service.getOrderById(100, 999, UserType.ADMIN);
      expect(order).toEqual(mockOrder);
    });

    it('should throw ForbiddenException if user is neither owner nor admin', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      await expect(
        service.getOrderById(100, 999, UserType.USER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);
      await expect(service.getOrderById(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
