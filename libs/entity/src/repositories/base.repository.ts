import { Injectable } from '@nestjs/common';
import {
  Repository,
  QueryRunner,
  EntityTarget,
  SelectQueryBuilder,
} from 'typeorm';

@Injectable()
export abstract class BaseRepository<T> {
  protected repository: Repository<T>;
  private readonly entityClass: EntityTarget<T>;

  protected constructor(
    repository: Repository<T>,
    entityClass: EntityTarget<T>,
  ) {
    this.repository = repository;
    this.entityClass = entityClass;
  }

  protected getRepository(queryRunner?: QueryRunner): Repository<T> {
    return queryRunner
      ? queryRunner.manager.getRepository(this.entityClass)
      : this.repository;
  }

  private applySelectFields(
    queryBuilder: SelectQueryBuilder<any>,
    selectedFields: string[],
    fieldMappings: { [key: string]: string },
  ) {
    const uniqueFields = new Set<string>();
    selectedFields.forEach((field) => {
      if (fieldMappings[field]) {
        uniqueFields.add(fieldMappings[field]);
      } else {
        console.warn(`Field mapping not found for: ${field}`);
      }
    });

    // 선택된 필드만 추가
    uniqueFields.forEach((field) => {
      const alias = this.toSnakeCase(field.replace(/\./g, '_'));
      console.log('field : ', field);
      queryBuilder.addSelect(field, alias);
    });
  }

  private applyJoinFields(
    queryBuilder: SelectQueryBuilder<any>,
    selectedFields: string[],
    joinMappings: { [key: string]: string },
  ) {
    const uniqueJoins = new Set<string>();
    selectedFields.forEach((field) => {
      const parts = field.split('.');
      if (parts.length > 1 && joinMappings[parts[0]]) {
        uniqueJoins.add(joinMappings[parts[0]]);
      }
    });
    uniqueJoins.forEach((join) => {
      const alias = join.split('.').pop();
      queryBuilder.leftJoin(join, alias);
    });
  }

  private applyConditions(
    queryBuilder: SelectQueryBuilder<any>,
    params: any,
    fieldMappings: { [key: string]: string },
  ) {
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && fieldMappings[key]) {
        queryBuilder.andWhere(`${fieldMappings[key]} = :${key}`, {
          [key]: params[key],
        });
      }
    });
  }

  async findBySelectField<U>(
    alias: string,
    params: any,
    fieldMappings: { [key: string]: string },
    joinMappings: { [key: string]: string },
    mapToDto: (entity: T, selectedFields: string[]) => U,
    qr?: QueryRunner,
  ): Promise<U | null> {
    const queryBuilder = this.getRepository(qr).createQueryBuilder(alias);

    this.applyConditions(queryBuilder, params, fieldMappings);
    // 선택적 필드 및 조인 적용
    const selectedFields = Array.isArray(params.selectedFields)
      ? params.selectedFields
      : [];

    // 기본 필드 조회 제거
    if (selectedFields.length > 0) {
      queryBuilder.select([]); // 기본 필드 제거
    }

    queryBuilder.select([]);

    this.applySelectFields(queryBuilder, selectedFields, fieldMappings);
    this.applyJoinFields(queryBuilder, selectedFields, joinMappings);

    const entity = await queryBuilder.getOne();
    console.log('entity: ', entity);
    if (!entity) {
      return null;
    }

    return mapToDto(entity, selectedFields);
  }

  toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}
