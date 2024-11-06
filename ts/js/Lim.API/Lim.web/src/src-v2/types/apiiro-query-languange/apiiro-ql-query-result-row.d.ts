import { BaseDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';

export interface ApiiroQlQueryResultRow {
  key: string;
  fields: any[];
  primaryObject: BaseDataModelReference;
}
