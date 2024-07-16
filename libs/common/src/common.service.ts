import { Injectable } from '@nestjs/common';
import { GraphQLResolveInfo } from 'graphql/type';

@Injectable()
export class CommonService {
  getSelectedFields(info: GraphQLResolveInfo): string[] {
    return info.fieldNodes[0].selectionSet.selections.map(
      (selection: any) => selection.name.value,
    );
  }
}
