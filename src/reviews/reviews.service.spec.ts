import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { ProductsService } from '../products/products.service';
import { usersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

type FindOneParam = { where: { id: number } };

describe('ReviewsService', () => {
  let reviewService: ReviewsService;
  let reviewRepository: Repository<Review>;
  let productService: ProductsService;
  let userService: usersService;

  const REPOSITORY_TOKEN = getRepositoryToken(Review);

  const mockUser = { id: 1, username: 'testuser', email: 'test@test.com' };
  const mockProduct = { id: 10, name: 'Test Product', price: 100 };
  const mockReview = {
    id: 1,
    rating: 5,
    comment: 'Great product!',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    user: mockUser,
    product: mockProduct,
  };

  const createReviewDto: CreateReviewDto = {
    rating: 5,
    comment: 'Great product!',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: ProductsService,
          useValue: {
            getOneBy: jest.fn((id: number) =>
              Promise.resolve({ ...mockProduct, id }),
            ),
          },
        },
        {
          provide: usersService,
          useValue: {
            getCurrentUser: jest.fn((userId: number) =>
              Promise.resolve({ ...mockUser, id: userId }),
            ),
          },
        },
        {
          provide: REPOSITORY_TOKEN,
          useValue: {
            create: jest.fn((dto: any) => ({
              id: 1,
              ...dto,
            })),
            save: jest.fn((review: any) =>
              Promise.resolve({
                id: review.id ?? 1,
                ...review,
              }),
            ),
            find: jest.fn(() => Promise.resolve([mockReview])),
            findOne: jest.fn((param: FindOneParam) => {
              if (param.where.id === mockReview.id) {
                return Promise.resolve({ ...mockReview });
              }
              return Promise.resolve(null);
            }),
            delete: jest.fn(() => Promise.resolve({ affected: 1 })),
          },
        },
      ],
    }).compile();

    reviewService = module.get<ReviewsService>(ReviewsService);
    reviewRepository = module.get<Repository<Review>>(REPOSITORY_TOKEN);
    productService = module.get<ProductsService>(ProductsService);
    userService = module.get<usersService>(usersService);
  });

  it('should be defined', () => {
    expect(reviewService).toBeDefined();
  });

  it('should have a review repository', () => {
    expect(reviewRepository).toBeDefined();
  });

  describe('createReview', () => {
    it('should call productService.getOneBy with the productId', async () => {
      await reviewService.createReview(10, 1, createReviewDto);
      expect(productService.getOneBy).toHaveBeenCalledWith(10);
    });

    it('should call userService.getCurrentUser with the userId', async () => {
      await reviewService.createReview(10, 1, createReviewDto);
      expect(userService.getCurrentUser).toHaveBeenCalledWith(1);
    });

    it('should call repository create and save', async () => {
      await reviewService.createReview(10, 1, createReviewDto);
      expect(reviewRepository.create).toHaveBeenCalledTimes(1);
      expect(reviewRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should return the created review with correct shape', async () => {
      const result = await reviewService.createReview(10, 1, createReviewDto);
      expect(result).toBeDefined();
      expect(result.comment).toBe('Great product!');
      expect(result.rating).toBe(5);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('productId');
    });
  });

  describe('getAllReviews', () => {
    it('should call repository find with pagination options', async () => {
      await reviewService.getAllReviews(1, 10);
      expect(reviewRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should calculate skip correctly for page 2', async () => {
      await reviewService.getAllReviews(2, 5);
      expect(reviewRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        skip: 5,
        take: 5,
      });
    });

    it('should return reviews array', async () => {
      const result = await reviewService.getAllReviews(1, 10);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
    });
  });

  describe('updateReview', () => {
    const updateDto: UpdateReviewDto = {
      rating: 3,
      comment: 'Updated comment',
    };

    it('should update own review successfully', async () => {
      const result = await reviewService.updateReview(1, 1, updateDto);
      expect(result).toBeDefined();
      expect(result.rating).toBe(3);
      expect(result.comment).toBe('Updated comment');
      expect(reviewRepository.save).toHaveBeenCalled();
    });

    it("should throw ForbiddenException when updating another user's review", async () => {
      await expect(
        reviewService.updateReview(1, 999, updateDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when review does not exist', async () => {
      await expect(
        reviewService.updateReview(999, 1, updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should keep existing rating when only comment is updated', async () => {
      const partialDto: UpdateReviewDto = { comment: 'Only comment' };
      const result = await reviewService.updateReview(1, 1, partialDto);
      expect(result.rating).toBe(mockReview.rating);
      expect(result.comment).toBe('Only comment');
    });
  });

  describe('deleteReview', () => {
    it('should delete own review successfully', async () => {
      const payload = { id: 1, userType: 'user' };
      const result = await reviewService.deleteReview(1, payload);
      expect(result).toEqual({ message: 'Review deleted successfully.' });
      expect(reviewRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should allow admin to delete any review', async () => {
      const payload = { id: 999, userType: 'ADMIN' };
      const result = await reviewService.deleteReview(1, payload);
      expect(result).toEqual({ message: 'Review deleted successfully.' });
      expect(reviewRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw ForbiddenException when non-owner non-admin tries to delete', async () => {
      const payload = { id: 999, userType: 'user' };
      await expect(reviewService.deleteReview(1, payload)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when review does not exist', async () => {
      const payload = { id: 1, userType: 'user' };
      await expect(reviewService.deleteReview(999, payload)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getReviewById (via updateReview/deleteReview)', () => {
    it('should throw NotFoundException when review is not found via updateReview', async () => {
      await expect(
        reviewService.updateReview(999, 1, { comment: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when review is not found via deleteReview', async () => {
      await expect(
        reviewService.deleteReview(999, { id: 1, userType: 'user' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
