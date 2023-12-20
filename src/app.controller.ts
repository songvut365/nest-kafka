import {
  Controller,
  Get,
  Inject,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { OrderService } from './order/order.service';
import {
  ClientKafka,
  ClientRedis,
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { Producer } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import { logError, logInfo } from 'src/lib/logger';
import { OrderMessage, OrderResult } from './order/order.model';
import { validateOrderMessage } from './order/order.validation';
import { ResponseCode } from 'src/constant/response.code';
import * as moment from 'moment';
import { Redis } from 'ioredis';

@Controller()
export class AppController implements OnModuleInit, OnApplicationShutdown {
  constructor(
    @Inject('PRODUCER') private kafkaClient: ClientKafka,
    @Inject('REDIS') private redisClient: ClientRedis,
    private readonly orderService: OrderService,
  ) {}

  private producer: Producer;
  private redis: Redis;

  @Get('/health')
  health() {
    return { status: 'ok' };
  }

  async onModuleInit() {
    try {
      this.producer = await this.kafkaClient.connect();
    } catch (error) {
      logError(`error during connect kafka client : ${error.message}`);
    }

    try {
      await this.redisClient.connect();
      this.redis = await this.redisClient.createClient();
    } catch (error) {
      logError(`error during connect redis client : ${error.message}`);
    }
  }

  async onApplicationShutdown() {
    try {
      await this.producer.disconnect();
    } catch (error) {
      logError(`error during disconnect kafka client : ${error.message}`);
    }
  }

  @MessagePattern('order.request')
  async createOrder(
    @Ctx() context: KafkaContext,
    @Payload() message: OrderMessage,
  ) {
    const startTime = performance.now();
    const { headers, value } = context.getMessage();
    let refId: string = (headers['X-Request-Id'] as string) || uuidv4();

    logInfo(`---- ${refId} ----`);
    logInfo(`consume message: ${JSON.stringify(value)}`);

    // check duplicate request
    const cacheRefId = await this.redis.get(refId);
    if (cacheRefId) {
      this.sendOrderResult(refId, ResponseCode.DuplicateEntry, null);
      return;
    }
    await this.redis.set(refId, 1);

    // validate
    try {
      validateOrderMessage(message);
    } catch (error) {
      logError(`validate order message error: ${error.message}`);
      this.sendOrderResult(refId, ResponseCode.InvalidInput, error.message);
      return;
    }

    // processing
    try {
      const successItems = await this.orderService.createOrderProcess(message);
      if (successItems) {
        const orderResult: OrderMessage = {
          ...message,
          items: successItems,
          timestamp: moment().format('DD/MM/YYY HH:mm:ss'),
        };

        this.sendOrderResult(refId, ResponseCode.Success, null, orderResult);
      } else {
        this.sendOrderResult(refId, ResponseCode.InvalidInput, null);
      }

      let elapseTime = performance.now() - startTime;
      logInfo(`processing time: ${elapseTime}ms`);
    } catch (error) {
      logError(`process create order error: ${error.message}`);

      switch (error.message) {
        case ResponseCode[ResponseCode.AccessDenied]:
          this.sendOrderResult(refId, ResponseCode.AccessDenied, null);
          break;

        default:
          this.sendOrderResult(refId, ResponseCode.InternalError, null);
          break;
      }
    }
  }

  private sendOrderResult(
    refId: string,
    responseCode: number,
    responseDesc: string,
    orderMessage?: OrderMessage,
  ) {
    if (responseDesc === null) {
      responseDesc = ResponseCode[responseCode];
    }
    let orderResult: OrderResult = {
      code: responseCode,
      description: responseDesc,
      orderRequest: orderMessage,
    };

    let output = {
      topic: 'order.result',
      messages: [
        {
          headers: { 'X-Request-Id': refId },
          value: JSON.stringify(orderResult),
        },
      ],
    };

    logInfo(`produce message: ${output.messages[0].value}`);

    this.producer.send(output);
  }
}
