import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from './favorites.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Favorite } from './favorite.entity';
import { ProductsService } from '../products/products.service';
import { usersService } from '../users/users.service';
import { NotFoundException } from '@nestjs/common';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let mockFavoriteRepository: any;
  let mockProductsService: any;
  let mockUsersService: any;

  const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
  const mockProduct = { id: 10, name: 'Cool Keyboard', price: 99.99 };
  const mockFavorite = {
    id: 1,
    user: mockUser,
    product: mockProduct,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockFavoriteRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest
        .fn()
        .mockImplementation((fav) => Promise.resolve({ id: 1, ...fav })),
      remove: jest.fn().mockResolvedValue(true),
    };

    mockProductsService = {
      getOneBy: jest.fn(),
    };

    mockUsersService = {
      getCurrentUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: getRepositoryToken(Favorite),
          useValue: mockFavoriteRepository,
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

    service = module.get<FavoritesService>(FavoritesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserFavorites', () => {
    it('should return list of user favorites', async () => {
      mockFavoriteRepository.find.mockResolvedValue([mockFavorite]);
      const result = await service.getUserFavorites(1);
      expect(result).toEqual([mockFavorite]);
      expect(mockFavoriteRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('addFavorite', () => {
    it('should add a product to favorites if not already present', async () => {
      mockProductsService.getOneBy.mockResolvedValue(mockProduct);
      mockFavoriteRepository.findOne.mockResolvedValue(null);
      mockUsersService.getCurrentUser.mockResolvedValue(mockUser);

      const result = await service.addFavorite(1, 10);
      expect(result).toEqual({
        message: 'Product added to favorites',
        isFavorite: true,
      });
      expect(mockFavoriteRepository.save).toHaveBeenCalled();
    });

    it('should return already in favorites if favorite exists', async () => {
      mockProductsService.getOneBy.mockResolvedValue(mockProduct);
      mockFavoriteRepository.findOne.mockResolvedValue(mockFavorite);

      const result = await service.addFavorite(1, 10);
      expect(result).toEqual({
        message: 'Product already in favorites',
        isFavorite: true,
      });
      expect(mockFavoriteRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockProductsService.getOneBy.mockResolvedValue(null);
      await expect(service.addFavorite(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeFavorite', () => {
    it('should remove product from favorites if it exists', async () => {
      mockFavoriteRepository.findOne.mockResolvedValue(mockFavorite);
      const result = await service.removeFavorite(1, 10);
      expect(result).toEqual({
        message: 'Product removed from favorites',
        isFavorite: false,
      });
      expect(mockFavoriteRepository.remove).toHaveBeenCalledWith(mockFavorite);
    });

    it('should return isFavorite: false if product was not in favorites', async () => {
      mockFavoriteRepository.findOne.mockResolvedValue(null);
      const result = await service.removeFavorite(1, 10);
      expect(result).toEqual({
        message: 'Product was not in favorites',
        isFavorite: false,
      });
      expect(mockFavoriteRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('isFavorite', () => {
    it('should return true if product is favorited', async () => {
      mockFavoriteRepository.findOne.mockResolvedValue(mockFavorite);
      const result = await service.isFavorite(1, 10);
      expect(result).toBe(true);
    });

    it('should return false if product is not favorited', async () => {
      mockFavoriteRepository.findOne.mockResolvedValue(null);
      const result = await service.isFavorite(1, 10);
      expect(result).toBe(false);
    });
  });
});
