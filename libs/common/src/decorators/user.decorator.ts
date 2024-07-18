import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserEntity } from '@lib/entity';

export const User = createParamDecorator(
  (data: keyof UserEntity | undefined, context: ExecutionContext) => {
    // Http 설정
    // const req = context.switchToHttp().getRequest();

    // GraphQL 설정
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;

    const user = req.user as UserEntity;

    if (!user) {
      throw new InternalServerErrorException();
    }

    return data ? user[data] : user;
  },
);
