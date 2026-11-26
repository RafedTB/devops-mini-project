import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Repository, Like, Between } from 'typeorm';
import { Product } from './product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { usersService } from '../users/users.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly userService: usersService,
  ) {}

  /**
   * Create a new product
   * @param dto a CreateProductDto object containing the product details
   * @param userId a number representing the ID of the user creating the product
   * @returns a Promise that resolves to the newly created product
   */
  public async createProduct(dto: CreateProductDto, userId: number) {
    const user = await this.userService.getCurrentUser(userId);
    const product = this.productRepository.create({
      ...dto,
      name: dto.name,
      user,
    });
    return await this.productRepository.save(product);
  }

  /**
   * Get all products
   * @returns collection of all products in the database
   */
  public async getAll(name?: string, minPrice?: number, maxPrice?: number) {
    const filters = {
      ...(name ? { name: Like(`%${name}%`) } : {}),
      ...(minPrice
        ? { price: Between(minPrice, maxPrice || Number.MAX_SAFE_INTEGER) }
        : {}),
    };

    return await this.productRepository.find({ where: filters });
  }

  /**
   * Get a product by id
   * @param id a number representing the ID of the product to retrieve
   * @returns a Promise that resolves to the product with the specified ID
   * @throws NotFoundException if the product with the specified ID does not exist
   */
  public async getOneBy(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  /**
   * Update product by id
   * @param id a number representing the ID of the product to update
   * @param UpdateProductDto an object containing the updated product details
   * @returns a Promise that resolves to the updated product
   */
  public async update(id: number, UpdateProductDto: UpdateProductDto) {
    const product = await this.getOneBy(id);
    Object.assign(product, UpdateProductDto);
    return await this.productRepository.save(product);
  }

  /**
   * async delete product by id
   * @param id a number representing the ID of the product to delete
   * @returns a Promise that resolves to a message indicating the product has been deleted
   */

  public async delete(id: number) {
    const product = await this.getOneBy(id);
    await this.productRepository.remove(product);
    return { message: `Product with id ${id} has been deleted` };
  }
}
