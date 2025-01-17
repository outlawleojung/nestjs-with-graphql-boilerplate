import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';
import { DataSource } from 'typeorm';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    // Http 설정
    // const req = context.switchToHttp().getRequest();

    // GraphQL 설정
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    req.queryRunner = queryRunner;

    return next.handle().pipe(
      catchError(async (e) => {
        console.log('TypeOrm queryRunner error: ', e);
        await queryRunner.rollbackTransaction();
        await queryRunner.release();

        throw new InternalServerErrorException(e.message);
      }),
      tap(async () => {
        await queryRunner.commitTransaction();
        await queryRunner.release();
      }),
    );
  }
}
