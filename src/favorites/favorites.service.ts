import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { ProductsService } from '../products/products.service';
import { usersService } from '../users/users.service';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    private readonly productsService: ProductsService,
    private readonly userService: usersService,
  ) {}

  public async getUserFavorites(userId: number): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  public async addFavorite(userId: number, productId: number) {
    const product = await this.productsService.getOneBy(productId);
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });

    if (existing) {
      return { message: 'Product already in favorites', isFavorite: true };
    }

    const user = await this.userService.getCurrentUser(userId);
    const favorite = this.favoriteRepository.create({ user, product });
    await this.favoriteRepository.save(favorite);

    return { message: 'Product added to favorites', isFavorite: true };
  }

  public async removeFavorite(userId: number, productId: number) {
    const favorite = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });

    if (!favorite) {
      return { message: 'Product was not in favorites', isFavorite: false };
    }

    await this.favoriteRepository.remove(favorite);
    return { message: 'Product removed from favorites', isFavorite: false };
  }

  public async isFavorite(userId: number, productId: number): Promise<boolean> {
    const favorite = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });
    return !!favorite;
  }
}
