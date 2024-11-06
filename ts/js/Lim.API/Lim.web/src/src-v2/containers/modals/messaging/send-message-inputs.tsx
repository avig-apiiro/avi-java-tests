import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { GroupBase } from 'react-select/dist/declarations/src/types';
import styled from 'styled-components';
import { ClampText } from '@src-v2/components/clamp-text';
import { CheckboxToggle, Input } from '@src-v2/components/forms';
import { SelectControlV2, TextareaControl } from '@src-v2/components/forms/form-controls';
import { InputClickableLabel } from '@src-v2/components/forms/form-layout-v2';
import { SelectV2 } from '@src-v2/components/select/select-v2';
import { useInject, useSuspense, useToggle } from '@src-v2/hooks';
import { useCollapsible } from '@src-v2/hooks/use-collapsible';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';

type ChannelOption = {
  id: string;
  label: string;
  name: string;
  disabled?: boolean;
};

export function ChannelSelect({
  messageType,
  creatable,
  riskData,
}: {
  messageType: string;
  creatable: boolean;
  riskData?: RiskTriggerSummaryResponse;
}) {
  const { application, messaging, orgTeamProfiles } = useInject();
  const [channels, orgTeamChannelOptions] = useSuspense([
    [messaging.getChannels, { provider: messageType }] as const,
    [
      orgTeamProfiles.getTeamsCommunicationChannelOptions,
      {
        keys: riskData?.orgTeams.map(team => team.key),
        provider: messageType,
      },
    ] as const,
  ]);

  const options = useMemo<(ChannelOption | GroupBase<ChannelOption>)[]>(() => {
    const modifiedChannels = channels.map(item => ({
      ...item,
      label: item?.teamId ? `${item.teamId}: ${item?.name}` : item?.name,
      name: item.name,
    }));

    if (
      !application.isFeatureEnabled(FeatureFlag.OrgTeamsCommunication) ||
      !orgTeamChannelOptions.length
    ) {
      return modifiedChannels;
    }

    const channelById = _.keyBy(channels, 'id');
    return [
      {
        label: 'OrgTeamOptionsGroup',
        options: orgTeamChannelOptions.map(response => {
          const channel = channelById[response.channelKey];
          return {
            id: `${response.key}__${response.channelKey}`,
            name: channel.name,
            label: `${response.name} (${channel.name})`,
          };
        }),
      },
      {
        label: 'channelOptionsGroup',
        options: modifiedChannels,
      },
    ];
  }, [channels, orgTeamChannelOptions, application]);

  const validateChannelName = useCallback(
    (option: ChannelOption) =>
      !creatable || /^[a-z\d][a-z\d._-]*$/.test(option.name) || 'Channel name is invalid',
    [creatable]
  );

  return (
    <FieldSet>
      Send to
      <SelectControlV2
        fitMenuToContent
        name="channel"
        keyBy="id"
        creatable={creatable}
        rules={{
          required: true,
          validate: { validateChannelName },
        }}
        options={options}
        option={({ data }) => <ClampText>{data.label}</ClampText>}
        formatCreateLabel={(label: string) => `Add ${label}`}
        getNewOptionData={(label: string) => ({ name: label, label })}
      />
    </FieldSet>
  );
}

export function CustomContentField() {
  const { resetField } = useFormContext();
  const [isOpen, toggleCollapsible] = useToggle();
  const { getContentProps } = useCollapsible<HTMLFieldSetElement>({
    open: isOpen,
    onClose: () => resetField('customContent'),
  });

  return (
    <FieldSet>
      <InputClickableLabel>
        <CheckboxToggle checked={isOpen} onChange={toggleCollapsible} />
        Add custom content
      </InputClickableLabel>
      <FieldSet {...getContentProps()}>
        <TextareaControl
          name="customContent"
          placeholder="Add more information you would like to share or a friendly personal note..."
          charLimit={100}
        />
      </FieldSet>
    </FieldSet>
  );
}

const FieldSet = styled.fieldset`
  &[data-invalid] ${Input} {
    border-color: var(--color-red-45);
  }

  ${InputClickableLabel} {
    display: flex;
    margin-bottom: 1rem;
    align-items: center;
    gap: 2rem;
  }

  ${SelectV2.Container} {
    width: 57rem;
  }
`;
