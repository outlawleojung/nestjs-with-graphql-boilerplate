import { Injectable } from '@nestjs/common';
import { GraphQLResolveInfo } from 'graphql/type';
import graphqlFields from 'graphql-fields';

@Injectable()
export class CommonService {
  getSelectedFields(info: GraphQLResolveInfo): string[] {
    const fields = graphqlFields(info);
    return this.flattenFields(fields);
  }

  private flattenFields(fields: any, prefix = ''): string[] {
    let result = [];
    for (const key in fields) {
      const fieldPath = prefix ? `${prefix}.${key}` : key;
      result.push(fieldPath);
      if (fields[key] && typeof fields[key] === 'object') {
        const subFields = this.flattenFields(fields[key], fieldPath);
        result = result.concat(subFields);
      }
    }
    return result;
  }
}
