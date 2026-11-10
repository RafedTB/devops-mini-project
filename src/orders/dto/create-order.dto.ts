import { IsString, IsNotEmpty, IsArray, ValidateNested, ArrayMinSize, IsInt, Min, IsPositive } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class OrderItemDto {
    @ApiProperty({ example: 1, description: 'Product ID' })
    @IsInt()
    @IsPositive()
    productId!: number;

    @ApiProperty({ example: 2, description: 'Quantity ordered' })
    @IsInt()
    @Min(1)
    quantity!: number;
}

export class CreateOrderDto {
    @ApiProperty({ example: 'John Doe', description: 'Full name for delivery' })
    @IsString()
    @IsNotEmpty()
    fullName!: string;

    @ApiProperty({ example: '123 Main St, Apt 4B', description: 'Delivery street address' })
    @IsString()
    @IsNotEmpty()
    address!: string;

    @ApiProperty({ example: 'New York', description: 'City' })
    @IsString()
    @IsNotEmpty()
    city!: string;

    @ApiProperty({ example: '10001', description: 'Postal or ZIP code' })
    @IsString()
    @IsNotEmpty()
    postalCode!: string;

    @ApiProperty({ example: '+1 555-123-4567', description: 'Phone number' })
    @IsString()
    @IsNotEmpty()
    phone!: string;

    @ApiProperty({ type: [OrderItemDto], description: 'List of products with quantities' })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items!: OrderItemDto[];
}
