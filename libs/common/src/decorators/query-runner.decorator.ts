import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const QueryRunner = createParamDecorator(
  (data, context: ExecutionContext) => {
    // Http 설정
    // const req = context.switchToHttp().getRequest();

    // GraphQL 설정
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;

    if (!req.queryRunner) {
      throw new InternalServerErrorException('Query Runner 가 없습니다.');
    }

    return req.queryRunner;
  },
);
