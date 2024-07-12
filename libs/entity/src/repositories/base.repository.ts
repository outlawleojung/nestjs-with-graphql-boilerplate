import { Injectable } from '@nestjs/common';
import { Repository, QueryRunner, EntityTarget } from 'typeorm';

@Injectable()
export abstract class BaseRepository<T> {
  protected repository: Repository<T>;
  private entityClass: EntityTarget<T>;

  constructor(repository: Repository<T>, entityClass: EntityTarget<T>) {
    this.repository = repository;
    this.entityClass = entityClass;
  }

  protected getRepository(queryRunner?: QueryRunner): Repository<T> {
    return queryRunner
      ? queryRunner.manager.getRepository(this.entityClass)
      : this.repository;
  }
}
