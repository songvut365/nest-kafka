import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from './app.module';
import { logInfo } from './lib/logger';

async function bootstrap() {
  // HTTP SERVER
  logInfo('creating nest.js http server microservice');
  const httpServer = await NestFactory.create(AppModule, {
    logger: false,
  });

  logInfo(
    'nest.js http server microservice created, starting listening process...',
  );
  await httpServer.listen(3000);
  logInfo('http server started on :3000');

  // KAFKA CONSUMER
  logInfo('creating nest.js consumer app microservice');
  const consumerApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: `consumer-${uuidv4()}`,
          brokers: ['localhost:9092'],
        },
        consumer: {
          groupId: 'order-service-consumer',
        },
      },
      logger: false,
    },
  );
  logInfo(
    'nest.js consumer app microservice created, starting consuming process...',
  );

  await consumerApp.listen();
  logInfo('consuming for kafka messages...');
}
bootstrap();
