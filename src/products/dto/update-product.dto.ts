import {
  IsString,
  IsNumber,
  IsOptional,
  Length,
  Min,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @Length(3, 50)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Name of the product',
    example: 'Product 1',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the product',
    example: 'This is a sample product',
  })
  @IsString()
  @IsOptional()
  @MinLength(5)
  description?: string;

  @ApiPropertyOptional({ description: 'Price of the product', example: 100 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @IsOptional()
  price?: number;
}
