import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenUtilsService } from '@lib/common';
import { UserValidationService } from '@lib/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(
    private readonly tokenUtilsService: TokenUtilsService,
    private readonly userValidationService: UserValidationService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;

    const rawToken = req.headers.authorization;

    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    const token = this.tokenUtilsService.extractTokenFromHeader(
      rawToken,
      false,
    );

    const { email, password } = this.tokenUtilsService.decodeBasicToken(token);

    req.user =
      await this.userValidationService.authenticateWithEmailAndPassword({
        email,
        password,
      });

    return true;
  }
}
