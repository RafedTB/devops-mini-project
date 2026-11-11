import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { AuthRolesGuard } from '../users/guards/auth-roles.guard';
import { currentUser } from '../users/decorators/current-user.decorator';
import type { JWTPayloadType } from '../utils/types';
import { Roles } from '../users/decorators/user-role.decorator';
import { UserType } from '../utils/enum';
import {
  ApiQuery,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';

@Controller('/api/products')
//@SkipThrottle()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  @ApiSecurity('bearer')
  public createNewProduct(
    @Body(new ValidationPipe()) body: CreateProductDto,
    @currentUser() payload: JWTPayloadType,
  ) {
    return this.productsService.createProduct(body, payload.id);
  }
  @Get()
  @ApiResponse({ status: 200, description: 'List of products' })
  @ApiOperation({ summary: 'Get all products with optional filters' })
  @ApiQuery({
    name: 'name',
    required: false,
    type: 'string',
    description: 'Filter by name',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: 'number',
    description: 'Filter by minimum price',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: 'number',
    description: 'Filter by maximum price',
  })
  public getAllProducts(
    @Query('name') name: string,
    @Query('minPrice') minPrice: number,
    @Query('maxPrice') maxPrice: number,
  ) {
    return this.productsService.getAll(name, minPrice, maxPrice);
  }
  @Get(':id')
  public getProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getOneBy(id);
  }
  @Put(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  @ApiSecurity('bearer')
  public updateProductById(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) body: UpdateProductDto,
  ) {
    return this.productsService.update(id, body);
  }
  @Delete(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  @ApiSecurity('bearer')
  public deleteProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.delete(id);
  }
}
