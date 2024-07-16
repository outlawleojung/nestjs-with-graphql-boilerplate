import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import {
  ENV_GRAPHQL_ID,
  ENV_GRAPHQL_PASSWD,
} from '@lib/common/constants/env-keys.const';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BasicAuthMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    if (req.path === '/graphql-playground') {
      const auth = req.headers.authorization;
      if (!auth || auth.split(' ')[0] !== 'Basic') {
        res.setHeader('WWW-Authenticate', 'Basic realm="GraphQL Playground"');
        throw new UnauthorizedException('Authentication required.');
      }

      const base64Credentials = auth.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString(
        'ascii',
      );
      const [username, password] = credentials.split(':');

      const validUsername = this.configService.get<string>(ENV_GRAPHQL_ID);
      const validPassword = this.configService.get<string>(ENV_GRAPHQL_PASSWD);

      if (username !== validUsername || password !== validPassword) {
        throw new UnauthorizedException('Invalid credentials.');
      }
    }
    next();
  }
}
