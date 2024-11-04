import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import {
  PredicateAndOperatorButton,
  PredicateDeleteButton,
  PredicateOrOperatorButton,
} from '@src-v2/components/apiiroql-query-editor/predicate-edit-buttons';
import { PredicateArgumentSelect } from '@src-v2/components/apiiroql-query-editor/predicate-edit-inputs';
import {
  TypeSwitchPredicateEditor,
  TypeSwitchPredicateEditorExtension,
} from '@src-v2/components/apiiroql-query-editor/type-switch-predicate-editor';
import {
  CreateDefaultExpression,
  ExpressionTypeByName,
  ExpressionTypeNames,
  QBooleanCombination,
  QExpression,
  QExpressionSchema,
} from '@src-v2/models/apiiroql-query/query-tree-model';
import { HasInsightPredicateEditor } from './has-insight-predicate-editor';
import { NamePredicateEditor } from './name-predicate-editor';
import { PredicateEditorRow } from './predicate-edit-containers';
import { PropertyPredicateEditor } from './property-predicate-editor';
import { BooleanCombinationEditor } from './query-editor-boolean-combiner';
import {
  QueryEditorRelationshipPredicate,
  QueryEditorRelationshipPredicateExtension,
} from './query-editor-relationship-predicate';

export type QueryEditorProps<TQuery extends QExpression> = {
  query: TQuery;
  setQuery: (newQuery: QExpression) => void;
  targetObjectTypeName: string;
  querySchema: QExpressionSchema;
  readOnly: boolean;
};

const PredicateTypeEditingInfo: {
  [typename in ExpressionTypeNames]: {
    predicateTypeDisplayName: string;
    editorCtor?: (props: QueryEditorProps<ExpressionTypeByName[typename]>) => JSX.Element;
    extendedEditorCtor?: (props: QueryEditorProps<ExpressionTypeByName[typename]>) => JSX.Element;
  };
} = {
  boolean: {
    predicateTypeDisplayName: 'boolean (dummy)',
  },

  property: {
    predicateTypeDisplayName: 'has property',
    editorCtor: PropertyPredicateEditor,
  },

  relationship: {
    predicateTypeDisplayName: 'has connection to',
    editorCtor: QueryEditorRelationshipPredicate,
    extendedEditorCtor: QueryEditorRelationshipPredicateExtension,
  },

  negatedRelationship: {
    predicateTypeDisplayName: 'has no connection to',
    editorCtor: QueryEditorRelationshipPredicate,
    extendedEditorCtor: QueryEditorRelationshipPredicateExtension,
  },

  name: {
    predicateTypeDisplayName: 'has name',
    editorCtor: NamePredicateEditor,
  },

  hasInsight: {
    predicateTypeDisplayName: 'has insight',
    editorCtor: HasInsightPredicateEditor,
  },

  negatedHasInsight: {
    predicateTypeDisplayName: 'has no insight',
    editorCtor: HasInsightPredicateEditor,
  },

  typeSwitch: {
    predicateTypeDisplayName: 'is of type',
    editorCtor: TypeSwitchPredicateEditor,
    extendedEditorCtor: TypeSwitchPredicateEditorExtension,
  },
};

export function QueryEditor(
  props: QueryEditorProps<QExpression> & { topRowExtensionControls?: React.ReactElement }
) {
  const { query } = props;

  if (query.type === 'boolean') {
    return <BooleanCombinationEditor {...props} query={query as QBooleanCombination} />;
  }

  return <QueryPredicateTypeSelectorAndEditor {...props} />;
}

export function QueryEditorWithBooleanWrappingSupport({
  query,
  setQuery,
  targetObjectTypeName,
  querySchema,
  deletable,
  readOnly = false,
}: QueryEditorProps<QExpression> & { deletable?: boolean }) {
  const wrapWithBoolean = useCallback(
    combiner => {
      setQuery({
        type: 'boolean',
        combiner,
        subExpressions: [query, CreateDefaultExpression(querySchema, targetObjectTypeName)],
      });
    },
    [setQuery, query, targetObjectTypeName, targetObjectTypeName, querySchema]
  );

  const wrappingControls =
    readOnly || query.type === 'boolean' ? null : (
      <>
        {deletable && <PredicateDeleteButton onClick={() => setQuery(null)} />}
        <PredicateAndOperatorButton onClick={() => wrapWithBoolean('and')} />
        <PredicateOrOperatorButton onClick={() => wrapWithBoolean('or')} />
      </>
    );

  return (
    <QueryEditorRowsContainer>
      <QueryEditor
        query={query}
        setQuery={setQuery}
        targetObjectTypeName={targetObjectTypeName}
        querySchema={querySchema}
        topRowExtensionControls={wrappingControls}
        readOnly={readOnly}
      />
      {!readOnly && query.type === 'boolean' && (
        <PredicateEditorRow>
          {query.combiner === 'and' && (
            <PredicateOrOperatorButton
              data-persistent="true"
              onClick={() => wrapWithBoolean('or')}
            />
          )}
          {query.type === 'boolean' && query.combiner === 'or' && (
            <PredicateAndOperatorButton
              data-persistent="true"
              onClick={() => wrapWithBoolean('and')}
            />
          )}
        </PredicateEditorRow>
      )}
    </QueryEditorRowsContainer>
  );
}

function QueryPredicateTypeSelectorAndEditor(
  props: QueryEditorProps<QExpression> & { topRowExtensionControls?: React.ReactElement }
) {
  const { query, setQuery, targetObjectTypeName, querySchema, topRowExtensionControls, readOnly } =
    props;

  const changeQueryType = useCallback(
    (targetType: string) =>
      setQuery(
        CreateDefaultExpression(
          querySchema,
          targetObjectTypeName,
          targetType as ExpressionTypeNames
        )
      ),
    [setQuery, targetObjectTypeName, querySchema]
  );

  const availablePredicatesInfo = useMemo(() => {
    const availablePredicatesInfo = Object.entries(PredicateTypeEditingInfo).filter(
      ([typename, typeInfo]) =>
        typeInfo.editorCtor &&
        CreateDefaultExpression(querySchema, targetObjectTypeName, typename as ExpressionTypeNames)
    );

    availablePredicatesInfo.sort((a, b) =>
      a[1].predicateTypeDisplayName.localeCompare(b[1].predicateTypeDisplayName)
    );

    return availablePredicatesInfo;
  }, [targetObjectTypeName, querySchema, query]);

  const PredicateFirstRowEditorCtor = PredicateTypeEditingInfo[query.type].editorCtor as (
    props: QueryEditorProps<QExpression>
  ) => JSX.Element;
  const PredicateSecondRowEditorCtor = PredicateTypeEditingInfo[query.type].extendedEditorCtor as (
    props: QueryEditorProps<QExpression>
  ) => JSX.Element;

  return (
    <QueryEditorRowsContainer>
      <PredicateEditorRow>
        <PredicateArgumentSelect
          value={availablePredicatesInfo.find(predicateInfo => predicateInfo[0] === query.type)}
          onItemSelected={predicateInfo => changeQueryType(predicateInfo[0])}
          items={availablePredicatesInfo}
          readOnly={readOnly}
          itemToString={item => item[1].predicateTypeDisplayName}
        />
        <PredicateFirstRowEditorCtor {...props} />
        {topRowExtensionControls && (
          <QueryEditorRowExtendedButtonsContainer>
            {topRowExtensionControls}
          </QueryEditorRowExtendedButtonsContainer>
        )}
      </PredicateEditorRow>
      {PredicateSecondRowEditorCtor && <PredicateSecondRowEditorCtor {...props} />}
    </QueryEditorRowsContainer>
  );
}

const QueryEditorRowsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const QueryEditorRowExtendedButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  min-height: 8rem;
  align-items: center;
  flex-grow: 1;
`;
