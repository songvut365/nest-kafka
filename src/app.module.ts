import { Module } from '@nestjs/common';
import { OrderService } from './order/order.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import { Partitioners, logLevel } from 'kafkajs';
import { ConfigModule } from '@nestjs/config';
import { UserService } from 'src/users/user.service';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './users/user.entity';
import { ProductEntity } from './product/product.entity';
import { ProductService } from './product/product.service';
import { OrderHistoryEntity } from './order/order.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientsModule.register([
      {
        name: 'PRODUCER',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: `producer-${uuidv4()}`,
            brokers: [process.env.KAFKA_BROKER],
            logLevel: logLevel.INFO,
          },
          producer: {
            allowAutoTopicCreation: true,
            transactionTimeout: 30000,
            createPartitioner: Partitioners.DefaultPartitioner,
          },
          producerOnlyMode: true,
        },
      },
      {
        name: 'REDIS',
        transport: Transport.REDIS,
        options: {
          host: 'localhost',
          port: 6379,
        },
      },
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT || '', 5432),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [UserEntity, ProductEntity, OrderHistoryEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([UserEntity, ProductEntity, OrderHistoryEntity]),
  ],
  controllers: [AppController],
  providers: [OrderService, UserService, ProductService],
})
export class AppModule {}
