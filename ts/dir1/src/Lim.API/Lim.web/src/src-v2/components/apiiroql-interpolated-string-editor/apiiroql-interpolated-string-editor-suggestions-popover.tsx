import { useMemo } from 'react';
import styled from 'styled-components';
import {
  CategorizedSelectionMenu,
  DetailsPane,
} from '@src-v2/components/apiiroql-query-editor/predicate-edit-categorized-select-with-details-pane';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { CircleButton } from '@src-v2/components/button-v2';
import { SvgIcon } from '@src-v2/components/icons';
import { Popover, hideOnItemClickPlugin } from '@src-v2/components/tooltips/popover';
import { Size } from '@src-v2/components/types/enums/size';
import { InventoryQueryObjectDescriptor } from '@src-v2/containers/inventory-query/inventory-query-object-options';
import { useInject, useSuspense } from '@src-v2/hooks';
import {
  QExpressionObjectSchema,
  QExpressionSchema,
} from '@src-v2/models/apiiroql-query/query-tree-model';

export type ApiiroQlInterpolatedStringEditorSuggestedTokenOptionsCategory = {
  label: string;
  items: {
    label: string;
    description: string;
    expression: string;
  }[];
};

export type TokenSuggestionsGenerator = (
  schema: QExpressionSchema
) => ApiiroQlInterpolatedStringEditorSuggestedTokenOptionsCategory[];

export const TokenSuggestionGenerators = {
  PropertiesForType(
    objectType: InventoryQueryObjectDescriptor,
    objectExpression: string
  ): TokenSuggestionsGenerator {
    return (schema: QExpressionSchema) => {
      const objectSchema: QExpressionObjectSchema = objectType ? schema[objectType.typeName] : null;

      return [
        {
          label: 'Properties',
          items: (objectSchema?.properties ?? [])
            .filter(
              property =>
                property.dataType === 'aqlBoolean' ||
                property.dataType === 'aqlTime' ||
                property.dataType === 'aqlString'
            )
            .map(propertyInfo => ({
              label: propertyInfo.displayName,
              expression: propertyInfo.apiiroQlGenerator(objectExpression),
              description: propertyInfo.description,
            })),
        },
      ];
    };
  },

  CustomExpression(): TokenSuggestionsGenerator {
    return _ => [
      {
        label: 'Other',
        items: [
          {
            label: 'Custom Expression',
            description: 'Insert a custom expression.',
            expression: '<Edit expression>',
          },
        ],
      },
    ];
  },

  AdditionalExpressions(
    additionalExpressions: ApiiroQlInterpolatedStringEditorSuggestedTokenOptionsCategory[]
  ): TokenSuggestionsGenerator {
    return _ => additionalExpressions;
  },
};

export function InterpolatedStringEditorSuggestionsPopover({
  onInsertToken,
  disabled,
  tokenSuggestionGenerators,
}: {
  onInsertToken: (token: string) => void;
  tokenSuggestionGenerators: TokenSuggestionsGenerator[];
  disabled: boolean;
}) {
  return (
    <TokenSuggestionPopover
      noDelay
      noArrow
      contentAs="ul"
      trigger="click"
      placement="bottom-start"
      content={
        tokenSuggestionGenerators && (
          <AsyncBoundary>
            <TokenSuggestionList
              tokenSuggestionGenerators={tokenSuggestionGenerators}
              onTokenSelected={onInsertToken}
            />
          </AsyncBoundary>
        )
      }
      plugins={[hideOnItemClickPlugin]}>
      <CircleButton
        size={Size.XSMALL}
        onClick={event => {
          event.stopPropagation();
          event.preventDefault();
        }}
        disabled={disabled}>
        <SvgIcon name="Plus" />
      </CircleButton>
    </TokenSuggestionPopover>
  );
}

function TokenSuggestionList({
  onTokenSelected,
  tokenSuggestionGenerators,
}: {
  onTokenSelected: (token: string) => void;
  tokenSuggestionGenerators: TokenSuggestionsGenerator[];
}) {
  const { inventoryQuery } = useInject();

  const querySchema = useSuspense(inventoryQuery.cachedGetQExpressionSchema, {
    schemaVariant: 'ApiiroQlRiskDiffableCondition',
    queriedType: null,
  }) as any;

  const suggestedTokenOptions = useMemo<
    ApiiroQlInterpolatedStringEditorSuggestedTokenOptionsCategory[]
  >(() => {
    return tokenSuggestionGenerators.flatMap(generator => generator(querySchema));
  }, [tokenSuggestionGenerators, querySchema]);

  return (
    <FullWidthCategorizedSelectionMenu
      value={null}
      onItemSelected={item => onTokenSelected(item.expression)}
      itemToDetailsPane={item => (
        <DetailsPane title={item?.expression}>{item?.description}</DetailsPane>
      )}
      categorizedItems={suggestedTokenOptions}
    />
  );
}

const TokenSuggestionPopover = styled(Popover)`
  ${Popover.Content} {
    max-width: 70vw;
    padding: 6rem;
  }

  max-width: 220rem;
  width: 220rem;
  border-radius: 3rem;
`;

const FullWidthCategorizedSelectionMenu = styled(CategorizedSelectionMenu)`
  font-size: 3.5rem;
`;
