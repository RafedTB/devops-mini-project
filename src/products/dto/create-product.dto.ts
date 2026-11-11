import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Length,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  @ApiProperty({ description: 'Name of the product', example: 'Product 1' })
  name: string = '';

  @ApiProperty({
    description: 'Description of the product',
    example: 'This is a sample product',
  })
  @IsString()
  @MinLength(5)
  description: string = '';

  @ApiProperty({ description: 'Price of the product', example: 100 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number = 0;
}
