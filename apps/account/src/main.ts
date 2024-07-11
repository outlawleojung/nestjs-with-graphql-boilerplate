import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ENV_SERVER_PORT } from '@lib/common';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger(bootstrap.name);

  const configService = app.get(ConfigService);
  const port = configService.get<number>(ENV_SERVER_PORT) || 3100;

  await app.listen(port);
  logger.log(`🐱Application is running on: ${await app.getUrl()}🐱‍🐉`);
}

bootstrap().catch((err: Error) => console.error(err));
