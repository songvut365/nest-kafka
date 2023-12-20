import { Inject, Injectable } from '@nestjs/common';
import { OrderItem, OrderMessage } from './order.model';
import { UserService } from 'src/users/user.service';
import { UserEntity } from 'src/users/user.entity';
import { logInfo, logWarn } from 'src/lib/logger';
import { ProductEntity } from 'src/product/product.entity';
import { ProductService } from 'src/product/product.service';
import { ResponseCode } from 'src/constant/response.code';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderHistoryEntity } from './order.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderHistoryEntity)
    private orderHistoryRepository: Repository<OrderHistoryEntity>,
  ) {}

  @Inject(UserService) private readonly userService: UserService;
  @Inject(ProductService) private readonly productService: ProductService;

  User;
  async createOrderProcess(
    orderMessage: OrderMessage,
  ): Promise<OrderItem[] | null> {
    try {
      // get user
      const user: UserEntity = await this.userService.getUserById(
        orderMessage.customerId,
      );

      if (user == null) {
        logInfo(`reject order: user not found`);
        throw new Error(ResponseCode[ResponseCode.AccessDenied]);
      }

      // get product and decrease quantity
      const successItems: OrderItem[] = [];
      for (let item of orderMessage.items) {
        let product: ProductEntity =
          await this.productService.DecreaseProductById(
            item.productId,
            item.amount,
          );

        if (product) {
          successItems.push(item);

          // save history
          await this.createOrderHistory(
            orderMessage.orderId,
            orderMessage.customerId,
            item.productId,
            item.amount,
          );
        }
      }

      const failedItem = orderMessage.items.length - successItems.length;
      if (failedItem === 0) {
        logInfo(`all order items are successful`);
      } else {
        logWarn(`${successItems.length} success and ${failedItem} failed`);
      }

      return successItems;
    } catch (error) {
      throw error;
    }
  }

  async createOrderHistory(
    orderId: string,
    customerId: string,
    productId: string,
    quantity: number,
  ): Promise<OrderHistoryEntity | null> {
    const orderHistory: OrderHistoryEntity = {
      orderHistoryId: uuidv4(),
      orderId: orderId,
      customerId: customerId,
      productId: productId,
      quantity: quantity,
      createdAt: new Date(),
    };

    const result = await this.orderHistoryRepository.save(orderHistory);
    if (result) {
      logInfo(`save order history success: ${JSON.stringify(result)}`);
    }

    return orderHistory;
  }
}
