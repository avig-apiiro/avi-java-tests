import styled from 'styled-components';
import { Dropdown } from '@src-v2/components/dropdown';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import {
  shouldDisableAdditionalProperty,
  useAdditionalProperties,
} from '@src-v2/containers/workflow/hooks/use-additional-properties';
import { AdditionalPropertiesInputFactory } from '@src-v2/containers/workflow/then/additional-propperties/additional-properties-input-factory';
import {
  AddStepMenu,
  RemoveButton,
  WorkflowLabel,
} from '@src-v2/containers/workflow/workflow-editor-controls';
import { StubAny } from '@src-v2/types/stub-any';
import { dataAttr, preventDefault } from '@src-v2/utils/dom-utils';

export const AdditionalProperties = ({
  thenState: { additionalProperties: selectedAdditionalProperties, ...thenState },
  isCustomSchema,
}: any) => {
  const {
    additionalPropertiesToDisplay,
    allAdditionalProperties,
    availableOptions,
    removeAdditionalProperty,
    addAdditionalProperty,
  } = useAdditionalProperties(isCustomSchema, thenState.index);

  return (
    <>
      <AdditionalPropertiesContainer
        data-hide-in-editor={dataAttr(
          additionalPropertiesToDisplay?.length === 0 && availableOptions?.length === 0
        )}>
        <AdditionalPropertiesList>
          <AddProperty>
            Additional properties{' '}
            {availableOptions?.length > 0 && (
              <AddStepMenu
                onClick={preventDefault}
                onItemClick={preventDefault}
                variant={Variant.TERTIARY}>
                <>
                  {availableOptions.map(option => {
                    const item = allAdditionalProperties?.find(
                      (prop: StubAny) => prop?.key === option
                    );

                    return (
                      <Dropdown.Item
                        key={item.key}
                        onClick={() => addAdditionalProperty(option)}
                        disabled={Boolean(shouldDisableAdditionalProperty(item, thenState))}>
                        {item?.displayName}
                      </Dropdown.Item>
                    );
                  })}
                </>
              </AddStepMenu>
            )}
          </AddProperty>
          {additionalPropertiesToDisplay?.map((additionalProperty: StubAny, index: number) => {
            const propertySettings = allAdditionalProperties?.find(
              (prop: StubAny) => prop?.key === additionalProperty.key
            );

            return (
              <AdditionalPropertyWrapper key={additionalProperty.uniqueKey}>
                <AdditionalPropertiesInputFactory
                  thenItem={thenState}
                  propertySettings={propertySettings}
                  initialValue={
                    selectedAdditionalProperties?.find(
                      (prop: StubAny) => prop?.type === additionalProperty.key
                    )?.value
                  }
                  name={`then[${thenState.index}].additionalProperties[${index}]`}
                  propertyKey={additionalProperty.key}
                />
                {!propertySettings?.required && (
                  <RemoveButton onClick={() => removeAdditionalProperty(index)} />
                )}
              </AdditionalPropertyWrapper>
            );
          })}
        </AdditionalPropertiesList>
      </AdditionalPropertiesContainer>
    </>
  );
};

const AdditionalPropertyWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  ${WorkflowLabel} {
    font-size: var(--font-size-s);
  }
`;

const AdditionalPropertiesContainer = styled.div`
  display: flex;
  align-items: flex-start;
  min-height: 8rem;
  gap: 2rem;
  padding: 1rem;
  border-radius: 2rem;
  border: 0.25rem solid var(--color-blue-gray-30);
  font-weight: 300;
  z-index: 1;

  [data-display-only] &:not(:has(${AdditionalPropertyWrapper})),
  *:not([data-display-only]) &[data-hide-in-editor] {
    display: none;
  }
`;

const AdditionalPropertiesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 0.75rem 1.75rem;
  white-space: nowrap;
`;

const AddProperty = styled.span`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  gap: 2rem;
  font-size: var(--font-size-s);
  color: var(--color-blue-gray-50);
`;
