import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "./order.entity";
import { OrderItem } from "./order-item.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { ProductsService } from "../products/products.service";
import { usersService } from "../users/users.service";
import { UserType } from "../utils/enum";

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly orderItemRepository: Repository<OrderItem>,
        private readonly productsService: ProductsService,
        private readonly userService: usersService,
    ) {}

    public async createOrder(userId: number, dto: CreateOrderDto): Promise<Order> {
        const user = await this.userService.getCurrentUser(userId);
        if (!user) throw new NotFoundException('User not found');

        if (!dto.items || dto.items.length === 0) {
            throw new BadRequestException('Order must contain at least one item');
        }

        let calculatedTotal = 0;
        const orderItems: OrderItem[] = [];

        for (const itemDto of dto.items) {
            const product = await this.productsService.getOneBy(itemDto.productId);
            if (!product) {
                throw new NotFoundException(`Product with ID ${itemDto.productId} not found`);
            }

            const itemPrice = Number(product.price);
            const lineTotal = itemPrice * itemDto.quantity;
            calculatedTotal += lineTotal;

            const orderItem = this.orderItemRepository.create({
                product,
                productName: product.name,
                productPrice: itemPrice,
                quantity: itemDto.quantity,
            });

            orderItems.push(orderItem);
        }

        const order = this.orderRepository.create({
            user,
            fullName: dto.fullName.trim(),
            address: dto.address.trim(),
            city: dto.city.trim(),
            postalCode: dto.postalCode.trim(),
            phone: dto.phone.trim(),
            totalPrice: Math.round(calculatedTotal * 100) / 100,
            status: 'confirmed',
            items: orderItems,
        });

        return await this.orderRepository.save(order);
    }

    public async getUserOrders(userId: number): Promise<Order[]> {
        return await this.orderRepository.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
        });
    }

    public async getOrderById(orderId: number, userId: number, userType?: string): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.user.id !== userId && userType !== UserType.ADMIN) {
            throw new ForbiddenException('You are not authorized to view this order');
        }

        return order;
    }
}
