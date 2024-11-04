import _ from 'lodash';
import { useCallback, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { AlertBanner, WarningBanner } from '@src-v2/components/banner';
import { Input } from '@src-v2/components/forms';
import { InputControl } from '@src-v2/components/forms/form-controls';
import { MultiSelect } from '@src-v2/components/forms/multi-select';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { ProviderChip } from '@src-v2/containers/applications/advanced-definitions-fields/advanced-definitions-tabs';
import { DropdownItemWithVendorIcon } from '@src-v2/containers/applications/multi-assets-collection';
import { SearchCombobox } from '@src-v2/containers/search-combobox';
import { PersistentSearchCombobox } from '@src-v2/containers/select-input';
import { defaultItemToString, useInject, useValidation } from '@src-v2/hooks';
import { StubAny } from '@src-v2/types/stub-any';

interface SecretsExclusionFormProps {
  missingPermissions?: boolean;
}

export const SecretsExclusionForm = ({ missingPermissions }: SecretsExclusionFormProps) => {
  const { validateEmptySpace } = useValidation();
  const {
    applicationProfiles,
    application: { integrations },
    rbac,
  } = useInject();
  const {
    getValues,
    formState: { isSubmitted, touchedFields },
    watch,
  } = useFormContext();
  const isPatternOrFilesEntered =
    Boolean(getValues().regexMatch.length) || Boolean(getValues().filesPathRegex.length);
  const [isAtLeastOneFilterSelected, setIsAtLeastOneFilterSelected] =
    useState(isPatternOrFilesEntered);

  const [repositories, applications, regexMatch, filesPathRegex] = watch([
    'repositories',
    'applications',
    'regexMatch',
    'filesPathRegex',
  ]);

  const tooltipContent = () => (
    <>
      Pattern exclusion is disabled in your environment.
      <br />
      Please contact your Apiiro Customer Success Manager to enable it.
    </>
  );

  return (
    <FormSection>
      <SecretsExclusionDescription>
        Excluding a secret will cause Apiiro to remove the risk from secrets that match this
        definition. Excluded secrets will appear in the inventory with exposure = ignored by
        definition.
      </SecretsExclusionDescription>

      {missingPermissions && (
        <WarningBanner
          title="You are missing some permissions"
          description="This definition was created with some repositories or applications you do not have access to. saving this definition will remove them from it"
        />
      )}

      <SecretsExclusionField>
        <SecretsExclusionLabel>Definition name</SecretsExclusionLabel>
        <InputControl
          name="name"
          placeholder="Definiton name"
          rules={{
            required: true,
            validate: validateEmptySpace,
          }}
          autoFocus
        />
      </SecretsExclusionField>
      <SecretsExclusionField>
        <SecretsExclusionLabel>
          Applications
          <InfoTooltip content="Choose which applications this definition applies to." />
        </SecretsExclusionLabel>
        <SecretsExclusionSelect
          name="applications"
          placeholder="Select applications"
          addAnyOption={rbac.hasGlobalScopeAccess}
          searchMethod={applicationProfiles.getApplications}
        />
      </SecretsExclusionField>
      <SecretsExclusionField>
        <SecretsExclusionLabel>
          Repositories
          <InfoTooltip content="Choose which repositories this definition applies to." />
        </SecretsExclusionLabel>
        <SecretsExclusionSelect
          name="repositories"
          placeholder="Select repositories"
          addAnyOption={rbac.hasGlobalScopeAccess}
          searchMethod={applicationProfiles.getRepositoryProfiles}
          itemToString={(item: StubAny) => `${item?.name}(${item?.referenceName} branch)`}
        />
      </SecretsExclusionField>
      {(isSubmitted || (touchedFields.applications && touchedFields.repositories)) &&
        _.isEmpty(applications) &&
        _.isEmpty(repositories) && (
          <AlertBanner description="You must specify which repositories or application this definition applies to" />
        )}

      <SecretsExclusionField>
        <SecretsExclusionLabel>Patterns</SecretsExclusionLabel>
        <Controller
          name="regexMatch"
          rules={{
            required:
              integrations.customerSecretsEncryptionEnabled &&
              !isAtLeastOneFilterSelected &&
              'Please select',
          }}
          render={({ field: { onChange, ...field } }) => (
            <Tooltip
              content={tooltipContent}
              disabled={integrations.customerSecretsEncryptionEnabled}>
              {/* The wrapper added in favor of enabling the tooltip - tippy not working on disabled element and that why the wrapper needed*/}
              <PatternsWrapperForTippy>
                <SearchCombobox
                  as={MultiSelect}
                  {...field}
                  // @ts-expect-error
                  placeholder="dummy, *dummy, dummy*, *dummy*. Submit by ENTER"
                  itemToString={defaultItemToString}
                  onSelect={(event: StubAny) => {
                    setIsAtLeastOneFilterSelected(
                      Boolean(event.selectedItems.length) ||
                        Boolean(getValues().filesPathRegex.length)
                    );
                    onChange(event.selectedItems?.map((item: StubAny) => item?.value ?? item));
                  }}
                  creatable
                  disabled={!integrations.customerSecretsEncryptionEnabled}
                />
              </PatternsWrapperForTippy>
            </Tooltip>
          )}
        />
      </SecretsExclusionField>
      <SecretsExclusionField>
        <SecretsExclusionLabel>
          Files
          <InfoTooltip
            content="Choose which files this definition applies to.
To apply to all, leave empty"
          />
          <SecretsExclusionLabelDesc>
            Exclude all secrets found in the file paths/patterns below
          </SecretsExclusionLabelDesc>
        </SecretsExclusionLabel>
        <Controller
          name="filesPathRegex"
          rules={{
            required: !isAtLeastOneFilterSelected,
          }}
          render={({ field: { onChange, ...field } }) => (
            <SearchCombobox
              as={MultiSelect}
              {...field}
              // @ts-expect-error
              placeholder="/src/test/*.yaml, src/logos/*, /app/qa/test.xml"
              itemToString={defaultItemToString}
              onSelect={(event: StubAny) => {
                setIsAtLeastOneFilterSelected(
                  Boolean(event.selectedItems.length) || Boolean(getValues().regexMatch.length)
                );
                onChange(event.selectedItems?.map((item: StubAny) => item?.value ?? item));
              }}
              creatable
            />
          )}
        />
      </SecretsExclusionField>
      {(isSubmitted || (touchedFields.regexMatch && touchedFields.filesPathRegex)) &&
        _.isEmpty(regexMatch) &&
        _.isEmpty(filesPathRegex) && (
          <AlertBanner description="You must enter at least one pattern or file pattern" />
        )}
    </FormSection>
  );
};

const anyOption = { name: 'Any', key: 'Any' };

const SecretsExclusionSelect = styled(
  ({
    searchMethod,
    placeholder,
    name,
    itemToString = defaultItemToString,
    addAnyOption,
    onSelect,
    ...props
  }: {
    searchMethod: Function;
    placeholder: string;
    name: string;
    itemToString?: Function;
    onSelect?: Function;
    addAnyOption?: boolean;
  }) => {
    const searchMethodEnriched = useCallback(
      (params: StubAny) =>
        searchMethod(params).then((data: StubAny) => {
          if (addAnyOption && params.pageNumber < 1) {
            return {
              ...data,
              items: [anyOption, ...data.items],
            };
          }
          return data;
        }),
      [searchMethod, addAnyOption]
    );

    return (
      <Controller
        name={name}
        render={({ field: { onChange, ...field } }) => (
          <PersistentSearchCombobox
            {...field}
            selectedItems={field.value}
            {...props}
            // @ts-expect-error
            as={MultiSelect}
            searchMethod={searchMethodEnriched}
            placeholder={placeholder}
            chip={ProviderChip}
            dropdownItem={(data: StubAny) => {
              const daraWithLabel = { ...data, useLabel: true };
              return <DropdownItemWithVendorIcon {...daraWithLabel} />;
            }}
            itemToString={
              addAnyOption
                ? (item: StubAny) => (item?.key === 'Any' ? item.name : itemToString(item))
                : itemToString
            }
            onSelect={(event: StubAny) => {
              if (
                !field.value?.some((_: StubAny) => _.name === 'Any') &&
                event.selectedItems.some((_: StubAny) => _.name === 'Any')
              ) {
                event.selectedItems = [anyOption];
              } else if (field.value?.some((_: StubAny) => _.name === 'Any')) {
                event.selectedItems = event.selectedItems.filter((_: StubAny) => _.name !== 'Any');
              }
              onChange(event.selectedItems);
              onSelect?.(event.selectedItems);
            }}
          />
        )}
      />
    );
  }
)`
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 3rem;

  ${Input} {
    width: 100%;
  }
`;

const SecretsExclusionField = styled.div`
  margin-top: 5rem;
`;

const SecretsExclusionLabel = styled.div`
  color: var(--color-blue-gray-60);
  font-size: var(--font-size-s);
  font-weight: 500;
  margin-bottom: 1rem;
`;

const FormSection = styled.div`
  flex-grow: 1;
  width: 100%;

  ${MultiSelect.Combobox} {
    width: 100%;
    border-radius: 2rem;
  }
`;

const SecretsExclusionDescription = styled.div`
  font-size: var(--font-size-s);
  font-weight: 400;
  color: var(--color-blue-gray-60);
`;

const SecretsExclusionLabelDesc = styled.div`
  font-size: var(--font-size-xs);
  font-weight: 300;
  color: var(--color-blue-gray-60);
`;

const PatternsWrapperForTippy = styled.div``;
