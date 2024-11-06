import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import styled from 'styled-components';
import { SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { FormFieldArray } from '@src-v2/components/forms/form-field-array';
import { VendorIcon } from '@src-v2/components/icons';
import { SelectV2 } from '@src-v2/components/select/select-v2';
import { TargetSelectControl } from '@src-v2/containers/organization-teams/creation-form/communication-channels/target-select-control';
import { getProviderDisplayName } from '@src-v2/data/providers';
import { useConditionalValidation, useInject, useValidation } from '@src-v2/hooks';
import { MessagingChannelResponse } from '@src-v2/services';
import { ProviderGroup } from '@src-v2/types/enums/provider-group';
import { ProjectProfile } from '@src-v2/types/profiles/project-profile';
import { StubAny } from '@src-v2/types/stub-any';

type ProviderOption = {
  key: ProviderGroup;
  label: ProviderGroup;
};

export type CommunicationChannelResult = {
  provider: ProviderOption;
  target: MessagingChannelResponse | ProjectProfile;
};

type CommunicationConfigurationsFieldProps = {
  name: string;
};

export function CommunicationConfigurationsField({ name }: CommunicationConfigurationsFieldProps) {
  const {
    application: { integrations },
  } = useInject();
  const selectedCommunicationResults: CommunicationChannelResult[] = useWatch({
    name,
  });

  const remainingProviderOptions = useMemo<ProviderOption[]>(() => {
    if (!integrations) {
      return [];
    }

    const providers = [
      integrations.connectedToSlack && ProviderGroup.Slack,
      integrations.connectedToTeams && ProviderGroup.Teams,
      integrations.connectedToGoogleChat && ProviderGroup.GoogleChat,
      integrations.connectedToJira && ProviderGroup.Jira,
      integrations.connectedToGithub && ProviderGroup.Github,
      integrations.connectedToAzureDevops && ProviderGroup.AzureDevops,
    ].filter(Boolean);

    if (!providers?.length) {
      return [];
    }

    const selectedProviders =
      selectedCommunicationResults?.map(item => item?.provider?.key).filter(Boolean) ?? [];

    return providers
      .filter(provider => !selectedProviders.includes(provider))
      .map(provider => ({
        key: provider,
        label: provider,
      }));
  }, [integrations, selectedCommunicationResults]);

  return (
    <FormFieldArray
      buttonText="Add channel"
      name={name}
      fieldContainer={CommunicationFieldContainer}
      disableAddButton={!remainingProviderOptions.length}>
      {({ name: fieldName }: { name: string }) => (
        <CommunicationChannelControl
          name={fieldName}
          remainingProviderOptions={remainingProviderOptions}
        />
      )}
    </FormFieldArray>
  );
}

function CommunicationChannelControl({
  name,
  remainingProviderOptions,
}: {
  name: string;
  remainingProviderOptions: ProviderOption[];
}) {
  const { validateEmptyItem } = useValidation();
  const { setValue } = useFormContext();
  const providerFieldName = useMemo(() => `${name}.provider`, [name]);
  const currentProviderOption: ProviderOption = useWatch({
    name: providerFieldName,
  });

  const handleProviderChange = useCallback(() => {
    setValue(`${name}.target`, null);
  }, []);

  const validateProvider = useConditionalValidation(validateEmptyItem, name);

  return (
    <>
      <SelectControlV2
        searchable={false}
        name={providerFieldName}
        placeholder="Select a tool..."
        options={remainingProviderOptions}
        rules={{ validate: validateProvider }}
        formatOptionLabel={(option: StubAny) => (
          <>
            <VendorIcon name={option.key} /> {getProviderDisplayName(option.key)}
          </>
        )}
        onChange={handleProviderChange}
      />
      in
      <TargetSelectControl
        name={`${name}.target`}
        disabled={!currentProviderOption}
        provider={currentProviderOption?.key}
        rules={{ validate: validateProvider }}
      />
    </>
  );
}

const CommunicationFieldContainer = styled(FormFieldArray.FieldContainer)`
  align-items: center;
  gap: 3rem;

  ${SelectV2.Container} {
    &:first-child {
      width: 55rem;
    }

    &:not(:first-child) {
      flex-grow: 1;
    }
  }
`;
