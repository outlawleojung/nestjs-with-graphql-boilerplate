import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ENV_SERVER_PORT } from '@lib/common';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql/utilities';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  const logger = new Logger(bootstrap.name);

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [
            `'self'`,
            'data:',
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          manifestSrc: [
            `'self'`,
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
        },
      },
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>(ENV_SERVER_PORT) || 3100;

  await app.listen(port);
  logger.log(`🐱Application is running on: ${await app.getUrl()}🐱‍🐉`);
}

bootstrap().catch((err: Error) => console.error(err));
