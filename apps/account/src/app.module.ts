import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import {
  BasicAuthMiddleware,
  ENV_JWT_EXPIRES_IN,
  ENV_JWT_SECRET,
} from '@lib/common';
import { AuthModule } from './apis/auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { UsersModule } from './apis/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(ENV_JWT_SECRET),
        signOptions: { expiresIn: config.get<string>(ENV_JWT_EXPIRES_IN) },
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'apps/account/src/commons/graphql/schema.gql',
      playground: true, // playground를 활성화
      path: '/graphql', // 새로운 URL 경로
    }),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BasicAuthMiddleware)
      .forRoutes({ path: 'graphql-playground', method: RequestMethod.GET });
  }
}
