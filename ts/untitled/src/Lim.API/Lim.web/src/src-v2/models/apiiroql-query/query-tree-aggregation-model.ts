import _ from 'lodash';
import { ApiiroQlQueryResultColumn, ApiiroQlQueryResultColumnType } from '@src-v2/services';

export type ApiiroQlQuerySingleFieldAggregationFunctionType =
  | 'count'
  | 'average'
  | 'max'
  | 'min'
  | 'pctcount'
  | 'some'
  | 'sum'
  | 'pctsum';

export type ApiiroQlQuerySingleFieldAggregationColumnDefinition = {
  $type: ApiiroQlQuerySingleFieldAggregationFunctionType;
  columnName: string;
  inputColumn: string;
};

export type ApiroQlQueryAggregationColumnDefinition =
  ApiiroQlQuerySingleFieldAggregationColumnDefinition;

export type ApiiroQlQueryAggregationDefinition = {
  groupByFields: string[];
  aggregationColumns: ApiroQlQueryAggregationColumnDefinition[];
};

export function getAggregationOptions(availableColumns: ApiiroQlQueryResultColumn[]): {
  availableColumnsForAggregateFunctionType: Partial<
    Record<
      ApiiroQlQuerySingleFieldAggregationColumnDefinition['$type'],
      ApiiroQlQueryResultColumn[]
    >
  >;

  allAvailableAggregateFunctions: ApiiroQlQuerySingleFieldAggregationFunctionType[];

  availableColumnsForGrouping: ApiiroQlQueryResultColumn[];
} {
  const availableColumnNamesForAggregateFunctionType: Partial<
    Record<
      ApiiroQlQuerySingleFieldAggregationColumnDefinition['$type'],
      ApiiroQlQueryResultColumn[]
    >
  > = _.omitBy(
    _.mapValues(aggregateFunctionTypeInformation, aggregateFunction => {
      const supported = availableColumns.filter(column =>
        aggregateFunction.supportedTypes.includes(column.type)
      );
      return supported.length ? supported : undefined;
    }),
    _.isNil
  );

  const allAvailableAggregateFunctions: ApiiroQlQuerySingleFieldAggregationFunctionType[] =
    Object.keys(
      availableColumnNamesForAggregateFunctionType
    ) as ApiiroQlQuerySingleFieldAggregationFunctionType[];

  const availableColumnsForGrouping = availableColumns.filter(
    column =>
      column.type === 'ApiiroQlQueryResultFieldNumber' ||
      column.type === 'ApiiroQlQueryResultFieldString' ||
      column.type === 'ApiiroQlQueryResultFieldBoolean'
  );

  return {
    availableColumnsForAggregateFunctionType: availableColumnNamesForAggregateFunctionType,
    allAvailableAggregateFunctions,
    availableColumnsForGrouping,
  };
}

export function createDefaultAggregationField(
  availableColumns: ApiiroQlQueryResultColumn[]
): ApiroQlQueryAggregationColumnDefinition {
  const { allAvailableAggregateFunctions, availableColumnsForAggregateFunctionType } =
    getAggregationOptions(availableColumns);

  const newField = {
    $type: allAvailableAggregateFunctions[0],
    inputColumn: availableColumnsForAggregateFunctionType[allAvailableAggregateFunctions[0]][0].key,
    columnName: '',
  };

  newField.columnName = suggestDefaultAggregationColumnName(newField);

  return newField;
}

export function suggestDefaultAggregationColumnName(
  aggregationColumnDefinition: ApiroQlQueryAggregationColumnDefinition
): string {
  return aggregateFunctionTypeInformation[aggregationColumnDefinition.$type].columnNameGenerator(
    aggregationColumnDefinition
  );
}

export const aggregateFunctionTypeInformation: {
  [functionType in ApiroQlQueryAggregationColumnDefinition['$type']]: {
    columnNameGenerator: (
      columnDefinition: ApiiroQlQuerySingleFieldAggregationColumnDefinition
    ) => string;
    displayName: string;
    supportedTypes: ApiiroQlQueryResultColumnType[];
  };
} = {
  average: {
    columnNameGenerator: columnDefinition => `Average ${columnDefinition.inputColumn}`,
    displayName: 'Average',
    supportedTypes: ['ApiiroQlQueryResultFieldNumber'],
  },
  max: {
    columnNameGenerator: columnDefinition => `Maximum of ${columnDefinition.inputColumn}`,
    displayName: 'Maximum',
    supportedTypes: ['ApiiroQlQueryResultFieldNumber'],
  },
  min: {
    columnNameGenerator: columnDefinition => `Minimum of ${columnDefinition.inputColumn}`,
    displayName: 'Minimum',
    supportedTypes: ['ApiiroQlQueryResultFieldNumber'],
  },
  pctcount: {
    columnNameGenerator: columnDefinition => `% of occurrences of ${columnDefinition.inputColumn}`,
    displayName: '% of occurrences',
    supportedTypes: [
      'ApiiroQlQueryResultFieldBoolean',
      'ApiiroQlQueryResultFieldDataModelObject',
      'ApiiroQlQueryResultFieldInsights',
      'ApiiroQlQueryResultFieldRiskTriggerInsights',
      'ApiiroQlQueryResultFieldString',
      'ApiiroQlQueryResultFieldNumber',
    ],
  },
  pctsum: {
    columnNameGenerator: columnDefinition => `% of ${columnDefinition.inputColumn}`,
    displayName: '% of total',
    supportedTypes: ['ApiiroQlQueryResultFieldNumber'],
  },
  some: {
    columnNameGenerator: columnDefinition => `Sample of ${columnDefinition.inputColumn}`,
    displayName: 'Sample value',
    supportedTypes: [
      'ApiiroQlQueryResultFieldBoolean',
      'ApiiroQlQueryResultFieldDataModelObject',
      'ApiiroQlQueryResultFieldInsights',
      'ApiiroQlQueryResultFieldRiskTriggerInsights',
      'ApiiroQlQueryResultFieldString',
      'ApiiroQlQueryResultFieldNumber',
    ],
  },
  sum: {
    columnNameGenerator: columnDefinition => `Total ${columnDefinition.inputColumn}`,
    displayName: 'Sum',
    supportedTypes: ['ApiiroQlQueryResultFieldNumber'],
  },
  count: {
    columnNameGenerator: columnDefinition => `# of ${columnDefinition.inputColumn}`,
    displayName: 'Count',
    supportedTypes: [
      'ApiiroQlQueryResultFieldBoolean',
      'ApiiroQlQueryResultFieldDataModelObject',
      'ApiiroQlQueryResultFieldInsights',
      'ApiiroQlQueryResultFieldRiskTriggerInsights',
      'ApiiroQlQueryResultFieldString',
      'ApiiroQlQueryResultFieldNumber',
    ],
  },
};
