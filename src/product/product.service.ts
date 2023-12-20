import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductEntity } from './product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { logInfo } from 'src/lib/logger';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private productEntity: Repository<ProductEntity>,
  ) {}

  async DecreaseProductById(
    productId: string,
    amount: number,
  ): Promise<ProductEntity | null> {
    try {
      // get product by id
      let product = await this.productEntity.findOneBy({ productId });
      if (!product) {
        logInfo(`productId: ${productId} not found`);
        return null;
      }
      logInfo(`found product: ${JSON.stringify(product)}`);

      // check quantity
      if (product.quantity - amount < 0) {
        logInfo(
          `product quantity remaining is less than quantity to be purchased`,
        );
        return null;
      }

      // update quantity
      product.quantity = product.quantity - amount;
      product.updatedAt = new Date();
      product = await this.productEntity.save(product, { reload: false });

      logInfo(`process product success: ${JSON.stringify(product)} `);
      return product;
    } catch (error) {
      throw new Error(`find one by productId error: ${error.message}`);
    }
  }
}
