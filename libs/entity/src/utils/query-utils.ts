import { SelectQueryBuilder } from 'typeorm';

export const applyConditions = (
  queryBuilder: SelectQueryBuilder<any>,
  params: Record<string, any>,
  conditionMappings: Record<string, string>,
) => {
  Object.keys(params).forEach((key) => {
    if (params[key] && conditionMappings[key]) {
      queryBuilder.andWhere(conditionMappings[key], { [key]: params[key] });
    }
  });
};

export const applySelectFields = (
  queryBuilder: SelectQueryBuilder<any>,
  baseEntity: string,
  selectedFields: string[],
  fieldMappings: Record<string, string>,
) => {
  const fields = selectedFields.map(
    (field) => fieldMappings[field] || `${baseEntity}.${field}`,
  );
  queryBuilder.select(fields);
};

export const applyJoinFields = (
  queryBuilder: SelectQueryBuilder<any>,
  joins: Record<string, string>,
) => {
  Object.keys(joins).forEach((key) => {
    queryBuilder.leftJoinAndSelect(joins[key], key);
  });
};
