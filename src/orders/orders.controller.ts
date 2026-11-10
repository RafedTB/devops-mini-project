import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards, ValidationPipe } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { AuthGuard } from "../users/guards/auth.guard";
import { currentUser } from "../users/decorators/current-user.decorator";
import type { JWTPayloadType } from "../utils/types";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";

@ApiTags('Orders')
@Controller('api/orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new order with delivery details' })
    @ApiResponse({ status: 201, description: 'Order created successfully' })
    public createOrder(
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) body: CreateOrderDto,
        @currentUser() user: JWTPayloadType,
    ) {
        return this.ordersService.createOrder(user.id, body);
    }

    @Get()
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all orders for the current user' })
    public getMyOrders(@currentUser() user: JWTPayloadType) {
        return this.ordersService.getUserOrders(user.id);
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get details of a specific order' })
    public getOrder(
        @Param('id', ParseIntPipe) id: number,
        @currentUser() user: JWTPayloadType,
    ) {
        return this.ordersService.getOrderById(id, user.id, user.userType);
    }
}
