import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { usersService } from '../users/users.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import type { JWTPayloadType } from '../utils/types';
import { UserType } from '../utils/enum';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly productService: ProductsService,
    private readonly userService: usersService,
  ) {}

  /**
   * create a new review for a product by a user
   * @param productId id of the product to be reviewed
   * @param userId id of the user creating the review
   * @param dto data for creating the review, including rating and comment
   * @returns createed review object from database
   */
  public async createReview(
    productId: number,
    userId: number,
    dto: CreateReviewDto,
  ) {
    const product = await this.productService.getOneBy(productId);
    const user = await this.userService.getCurrentUser(userId);
    const review = this.reviewRepository.create({
      ...dto,
      user,
      product,
    });
    const result = await this.reviewRepository.save(review);
    return {
      id: result.id,
      comment: result.comment,
      rating: result.rating,
      createdAt: result.createdAt,
      userId: result.user.id,
      productId: result.product.id,
    };
  }

  /**
   * get all reviews in the database, ordered by creation date in descending order
   * @param pageNumber the page number to retrieve
   * @param pageSize the number of reviews to retrieve per page
   * @returns collection of all reviews in the database
   */
  public async getAllReviews(pageNumber: number, pageSize: number) {
    return this.reviewRepository.find({
      order: { createdAt: 'DESC' },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });
  }

  /**
   * update a review by its ID, only if the user is the owner of the review
   * @param reviewId review ID to be updated
   * @param userId user ID of the user attempting to update the review
   * @param dto data for updating the review, including optional rating and comment
   * @returns updated review
   */
  public async updateReview(
    reviewId: number,
    userId: number,
    dto: UpdateReviewDto,
  ) {
    const review = await this.getReviewById(reviewId);
    if (review.user.id !== userId)
      throw new ForbiddenException(
        'Access denied. You can only update your own reviews.',
      );
    review.rating = dto.rating ?? review.rating;
    review.comment = dto.comment ?? review.comment;
    await this.reviewRepository.save(review);
    return review;
  }

  /**
   * delete a review by its ID, only if the user is the owner of the review or an admin
   * @param reviewId review ID to be deleted
   * @param userId user ID of the user attempting to delete the review
   * @returns delete confirmation message if successful, otherwise throws ForbiddenException
   */
  public async deleteReview(reviewId: number, payload: JWTPayloadType) {
    const review = await this.getReviewById(reviewId);
    if (
      review.user.id === payload.id ||
      payload.userType === UserType.ADMIN ||
      String(payload.userType).toUpperCase() === 'ADMIN'
    ) {
      await this.reviewRepository.delete(reviewId);
      return { message: 'Review deleted successfully.' };
    }
    throw new ForbiddenException(
      'Access denied. You can only delete your own reviews.',
    );
  }

  /**
   * get a review by its ID
   * @param reviewId review ID to search for
   * @returns review object if found, otherwise throws NotFoundException
   */
  private async getReviewById(reviewId: number) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }
}
