import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  AddAggregationOperatorButton,
  PredicateDeleteButton,
} from '@src-v2/components/apiiroql-query-editor/predicate-edit-buttons';
import { PredicateEditorRow } from '@src-v2/components/apiiroql-query-editor/predicate-edit-containers';
import {
  PredicateArgumentInput,
  PredicateArgumentSelect,
  PredicateChipMultiSelect,
} from '@src-v2/components/apiiroql-query-editor/predicate-edit-inputs';
import { Checkbox, CheckboxToggle } from '@src-v2/components/forms';
import { SvgIcon } from '@src-v2/components/icons';
import {
  ApiiroQlQueryAggregationDefinition,
  ApiiroQlQuerySingleFieldAggregationColumnDefinition,
  ApiiroQlQuerySingleFieldAggregationFunctionType,
  ApiroQlQueryAggregationColumnDefinition,
  aggregateFunctionTypeInformation,
  createDefaultAggregationField,
  getAggregationOptions,
  suggestDefaultAggregationColumnName,
} from '@src-v2/models/apiiroql-query/query-tree-aggregation-model';
import { ApiiroQlQueryResultColumn } from '@src-v2/services';

type OptionalAggregationQueryEditorProps = {
  availableColumns: ApiiroQlQueryResultColumn[];
  aggregation?: ApiiroQlQueryAggregationDefinition;
  onAggregationChanged: (aggregation?: ApiiroQlQueryAggregationDefinition) => void;
};

export function OptionalAggregationQueryEditor({
  aggregation,
  onAggregationChanged,
  availableColumns,
}: OptionalAggregationQueryEditorProps) {
  const handleToggleAggregation = useCallback(
    event => {
      onAggregationChanged(
        event.target.checked
          ? {
              groupByFields: [],
              aggregationColumns: [createDefaultAggregationField(availableColumns)],
            }
          : undefined
      );
    },
    [availableColumns, onAggregationChanged]
  );
  return (
    <>
      <AggregationEnableRow>
        <CheckboxToggle checked={Boolean(aggregation)} onChange={handleToggleAggregation} />
        Summarize
      </AggregationEnableRow>
      {availableColumns && aggregation && (
        <AggregationEditor
          aggregation={aggregation}
          onAggregationChange={onAggregationChanged}
          availableColumns={availableColumns}
        />
      )}
    </>
  );
}

type AggregationEditorProps = {
  aggregation: ApiiroQlQueryAggregationDefinition;
  onAggregationChange: (newAggregation: ApiiroQlQueryAggregationDefinition) => void;
  availableColumns: ApiiroQlQueryResultColumn[];
};

function AggregationEditor({
  aggregation,
  onAggregationChange,
  availableColumns,
}: AggregationEditorProps) {
  const { availableColumnsForAggregateFunctionType, allAvailableAggregateFunctions } = useMemo(
    () => getAggregationOptions(availableColumns),
    [availableColumns]
  );

  const [groupByOn, setGroupByOn] = useState(aggregation.groupByFields.length > 0);
  const [expandingGroupBy, setExpandingGroupBy] = useState(false);

  const handleGroupByOnUpdate = useCallback(
    value => {
      setExpandingGroupBy(true);
      if (!value.target.checked) {
        onAggregationChange({ ...aggregation, groupByFields: [] });
      }
      setGroupByOn(value.target.checked);
    },
    [onAggregationChange, setGroupByOn, aggregation]
  );

  const spliceAggregationFields = useCallback(
    (start: number, length: number, newValues: ApiroQlQueryAggregationColumnDefinition[] = []) => {
      const updatedAggregationFields = [...aggregation.aggregationColumns];
      updatedAggregationFields.splice(start, length, ...newValues);
      onAggregationChange({ ...aggregation, aggregationColumns: updatedAggregationFields });
    },
    [aggregation, onAggregationChange]
  );

  const handleDeleteAggregationField = useCallback(
    index => spliceAggregationFields(index, 1),
    [spliceAggregationFields]
  );

  const handleAddAggregationField = useCallback(
    index =>
      spliceAggregationFields(index + 1, 0, [createDefaultAggregationField(availableColumns)]),

    [spliceAggregationFields]
  );

  const handleSetFunctionType = useCallback(
    (index: number, functionType: ApiiroQlQuerySingleFieldAggregationFunctionType) => {
      const newAggregationFieldValue: ApiiroQlQuerySingleFieldAggregationColumnDefinition = {
        ...aggregation.aggregationColumns[index],
        $type: functionType,
      };

      if (
        !availableColumnsForAggregateFunctionType[functionType].find(
          availableColumn => availableColumn.key === newAggregationFieldValue.inputColumn
        )
      ) {
        newAggregationFieldValue.inputColumn =
          availableColumnsForAggregateFunctionType[functionType][0].key;
      }

      newAggregationFieldValue.columnName =
        suggestDefaultAggregationColumnName(newAggregationFieldValue);

      spliceAggregationFields(index, 1, [newAggregationFieldValue]);
    },
    [aggregation, spliceAggregationFields]
  );

  const handleSetInputColumn = useCallback(
    (index: number, inputColumn: string) => {
      const newAggregationFieldValue = { ...aggregation.aggregationColumns[index], inputColumn };
      newAggregationFieldValue.columnName =
        suggestDefaultAggregationColumnName(newAggregationFieldValue);
      spliceAggregationFields(index, 1, [newAggregationFieldValue]);
    },

    [aggregation, spliceAggregationFields]
  );

  const handleSetAggregationColumnName = useCallback(
    (index: number, columnName: string) =>
      spliceAggregationFields(index, 1, [{ ...aggregation.aggregationColumns[index], columnName }]),
    [aggregation, spliceAggregationFields]
  );

  const handleGroupBySelectionChange = useCallback(
    event => {
      const newSelectedGroupByColumns = event.selectedItems;
      onAggregationChange({
        ...aggregation,
        groupByFields: newSelectedGroupByColumns.map(groupByColumn => groupByColumn.key),
      });
    },
    [onAggregationChange, aggregation]
  );

  return (
    <>
      <AggregationFieldsContainer>
        {[...aggregation.aggregationColumns].map((field, index) => (
          <PredicateEditorRow key={index}>
            <PredicateArgumentSelect
              items={allAvailableAggregateFunctions}
              value={field.$type}
              itemToString={item => aggregateFunctionTypeInformation[item].displayName}
              onItemSelected={item => handleSetFunctionType(index, item)}
            />
            <span>&nbsp;of&nbsp;</span>
            <PredicateArgumentSelect
              items={availableColumnsForAggregateFunctionType[field.$type]}
              value={availableColumnsForAggregateFunctionType[field.$type].find(
                col => col.key === field.inputColumn
              )}
              itemToString={column => column.title}
              onItemSelected={item => handleSetInputColumn(index, item.key)}
            />
            <span>&nbsp;in column named&nbsp;</span>
            <AggregateColumnNameInput
              value={field.columnName}
              onChange={event => handleSetAggregationColumnName(index, event.target.value)}
            />
            {aggregation.aggregationColumns.length > 1 && (
              <PredicateDeleteButton onClick={() => handleDeleteAggregationField(index)} />
            )}
            <AddAggregationOperatorButton onClick={() => handleAddAggregationField(index)} />
          </PredicateEditorRow>
        ))}
      </AggregationFieldsContainer>
      <PredicateEditorRow>
        <Checkbox checked={groupByOn} onChange={handleGroupByOnUpdate} />
        {groupByOn ? (
          <>
            &nbsp;Group by:&nbsp;
            <GroupByChipMultiSelect
              items={availableColumns}
              selectedItems={aggregation.groupByFields.map(groupByFieldKey =>
                availableColumns.find(column => column.key === groupByFieldKey)
              )}
              startExpanded={expandingGroupBy}
              autoFocus={expandingGroupBy}
              showIconAtRight
              icon={<SvgIcon name="Chevron" />}
              itemToString={item => item?.title}
              onSelect={event => handleGroupBySelectionChange(event)}
            />
          </>
        ) : (
          <>&nbsp;Group by</>
        )}
      </PredicateEditorRow>
    </>
  );
}

const AggregationFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const AggregationEnableRow = styled(PredicateEditorRow)`
  gap: 2rem;
`;

const AggregateColumnNameInput = styled(PredicateArgumentInput)`
  min-width: 65rem;
`;

const GroupByChipMultiSelect = styled(PredicateChipMultiSelect)`
  max-width: calc(90% - 60rem);
`;
