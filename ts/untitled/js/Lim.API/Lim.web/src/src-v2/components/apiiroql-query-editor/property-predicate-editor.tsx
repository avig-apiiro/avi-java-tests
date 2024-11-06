import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import {
  DetailsPane,
  PredicateCategorizedSelectWithDetailsPane,
} from '@src-v2/components/apiiroql-query-editor/predicate-edit-categorized-select-with-details-pane';
import {
  PredicateArgumentDatePicker,
  PredicateArgumentInput,
  PredicateArgumentSelect,
  PredicateExtensibleEnumSelect,
} from '@src-v2/components/apiiroql-query-editor/predicate-edit-inputs';
import {
  QExpressionPropertyStereotype,
  apiiroQlOperatorSupportRegistry,
} from '@src-v2/models/apiiroql-query/apiiroql-generator';
import {
  QExpressionObjectSchemaProperty,
  QPropertyPredicate,
  QPropertyPredicateOperator,
  getFullObjectSchema,
} from '@src-v2/models/apiiroql-query/query-tree-model';
import { QueryEditorProps } from './query-editor';

const operandStereotypeRenderingOptions: {
  [stereotype in QExpressionPropertyStereotype]: { suffix?: string };
} = {
  aqlTimeSpan: { suffix: 'days' },
};

export function PropertyPredicateEditor({
  query,
  setQuery,
  targetObjectTypeName,
  querySchema,
  readOnly,
}: QueryEditorProps<QPropertyPredicate>) {
  const expandedTargetObjectSchema = useMemo(
    () => getFullObjectSchema(querySchema[targetObjectTypeName], querySchema),
    [targetObjectTypeName, querySchema]
  );

  const updatePropertyName = useCallback(
    propertyId => {
      const newPropertyInfo = expandedTargetObjectSchema.properties.find(
        property => property.id === propertyId
      );
      setQuery(
        Object.assign(
          {},
          {
            type: 'property',
            property: propertyId,
            operator: apiiroQlOperatorSupportRegistry[newPropertyInfo.dataType][0].operator,
            operand: newPropertyInfo.enumValues?.length
              ? newPropertyInfo.enumValues[0]
              : newPropertyInfo.dataType === 'aqlTime'
                ? new Date().toISOString()
                : '',
          }
        ) as QPropertyPredicate
      );
    },
    [setQuery, query, expandedTargetObjectSchema]
  );

  const selectedPropertyInfo = useMemo(
    () => expandedTargetObjectSchema.properties.find(property => property.id === query.property),
    [query, expandedTargetObjectSchema]
  );

  const operators = apiiroQlOperatorSupportRegistry[selectedPropertyInfo.dataType];
  const selectedOperator = operators.find(
    operatorSupport => operatorSupport.operator === query.operator
  );

  const updateOperator = useCallback(
    (operator: string) => {
      const operatorsDictionary = _.keyBy(operators, 'operator');
      const newOperator = operatorsDictionary[operator];
      const queryOperator = query.operator ? operatorsDictionary[query.operator] : undefined;

      setQuery(
        Object.assign({}, query, {
          operator,
          operand:
            newOperator?.operandType === queryOperator?.operandType ? query.operand : undefined,
        })
      );
    },
    [operators, setQuery, query]
  );

  const updateOperand = useCallback(
    (operand: string) => setQuery(Object.assign({}, query, { operand })),
    [setQuery, query]
  );

  const enumOptionsList = useMemo(() => {
    if (!selectedPropertyInfo.enumValues) {
      return null;
    }

    if (selectedPropertyInfo.unorderedEnum) {
      return selectedPropertyInfo.enumValues;
    }

    const optionList = [...selectedPropertyInfo.enumValues];
    optionList.sort((a, b) => a.localeCompare(b));

    return optionList;
  }, [selectedPropertyInfo]);

  const categorizedSortedProperties = useMemo(
    () => [
      {
        label: 'all',
        items: _.sortBy(expandedTargetObjectSchema.properties, ['displayName']),
      },
    ],
    [expandedTargetObjectSchema]
  );

  return (
    <>
      <PredicateCategorizedSelectWithDetailsPane
        value={expandedTargetObjectSchema.properties.find(
          property => property.id === query.property
        )}
        categorizedItems={categorizedSortedProperties}
        onItemSelected={item => updatePropertyName(item.id)}
        itemToString={item => item.displayName}
        itemToDescriptionPane={item => <PropertyDetailsPane propertyInfo={item} />}
        readOnly={readOnly}
        highlighted={true}
      />

      {operators.length > 1 ? (
        <PredicateArgumentSelect
          items={operators}
          value={selectedOperator}
          itemToString={operatorSupport => operatorSupport.displayName}
          onItemSelected={operatorSupport => updateOperator(operatorSupport.operator)}
          readOnly={readOnly}
        />
      ) : (
        <>{operators[0].displayName}</>
      )}

      {enumOptionsList && !NonEnumRestrictingOperators.includes(query.operator) ? (
        <PredicateExtensibleEnumSelect
          value={query.operand}
          enumItems={enumOptionsList}
          onChange={updateOperand}
          allowCustom={selectedPropertyInfo.openEnum}
          highlighted={true}
          readOnly={readOnly}
        />
      ) : (
        <HorizontalStack>
          {selectedOperator.operandType === 'aqlTime' ? (
            <PredicateArgumentDatePicker value={query.operand} onChange={updateOperand} />
          ) : (
            <PredicateArgumentInput
              value={query.operand}
              onChange={event => updateOperand(event.target.value)}
              readOnly={readOnly}
              data-highlighted
            />
          )}
          {selectedOperator.operandStereotype &&
            operandStereotypeRenderingOptions[selectedOperator.operandStereotype]?.suffix}
        </HorizontalStack>
      )}
    </>
  );
}

function PropertyDetailsPane({ propertyInfo }: { propertyInfo: QExpressionObjectSchemaProperty }) {
  return <DetailsPane title={propertyInfo?.displayName}>{propertyInfo?.description}</DetailsPane>;
}

const NonEnumRestrictingOperators: QPropertyPredicateOperator[] = [
  'ct',
  'nct',
  'stw',
  'enw',
  'nstw',
  'nenw',
];

const HorizontalStack = styled.div`
  display: flex;
  justify-content: flex-start;
  text-align: left;
  align-items: center;
  gap: 10px;
`;
