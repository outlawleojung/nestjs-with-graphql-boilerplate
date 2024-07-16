import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from '@lib/common';
import { TokenUtilsService } from '@lib/common';
import { UserEntityRepository } from '@lib/entity';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class BearerTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly tokenUtilService: TokenUtilsService,
    private readonly userRepository: UserEntityRepository,
  ) {}

  private readonly logger = new Logger(BearerTokenGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;

    const rawToken = req.headers.authorization;

    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    const token = this.tokenUtilService.extractTokenFromHeader(rawToken, true);

    const result = await this.tokenService.verifyToken(token);

    req.token = token;
    req.tokenType = result.type;
    req.user = await this.userRepository.findByEmail(result.email);

    return true;
  }
}

@Injectable()
export class AccessTokenGuard extends BearerTokenGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;

    if (req.tokenType !== 'access') {
      throw new UnauthorizedException('Access Token이 아닙니다.');
    }

    return true;
  }
}

@Injectable()
export class RefreshTokenGuard extends BearerTokenGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;

    if (req.tokenType !== 'refresh') {
      throw new UnauthorizedException('Refresh Token이 아닙니다.');
    }

    return true;
  }
}
