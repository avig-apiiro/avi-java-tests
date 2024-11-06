import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { ConfirmationModal, OnSubmitFunction } from '@src-v2/components/confirmation-modal';
import { InputControl } from '@src-v2/components/forms/form-controls';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { SvgIcon } from '@src-v2/components/icons';
import { Modal } from '@src-v2/components/modals';
import { Size } from '@src-v2/components/types/enums/size';
import { Caption1, Heading5 } from '@src-v2/components/typography';
import {
  ApplicationsScope,
  ApplicationsScopeContainer,
  TeamsScope,
} from '@src-v2/containers/pages/general-settings/sla/granular/assets-scopes';
import { convertGranularSlaPolicyToFormValues } from '@src-v2/containers/pages/general-settings/sla/granular/utils';
import {
  SlaPolicyControl,
  emptySlaPolicyError,
} from '@src-v2/containers/pages/general-settings/sla/sla-policy-control';
import { useInject, useSuspense } from '@src-v2/hooks';
import { GranulatedSlaPolicyDefinition, SlaPolicyDefinition } from '@src-v2/services';
import { ConfigurationRecord } from '@src-v2/services/profiles/asset-collection-profiles-base';
import { isEmptyDeep } from '@src-v2/utils/object-utils';
import { entries } from '@src-v2/utils/ts-utils';

type GranularSlaPolicyModalProps = {
  defaultPolicy: Partial<GranulatedSlaPolicyDefinition>;
  existingPolicies: GranulatedSlaPolicyDefinition[];
  onSubmit: (policy: GranulatedSlaPolicyDefinition) => void;
  onClose: () => void;
};

export type GranulatedSlaPolicyFormValues = Omit<GranulatedSlaPolicyDefinition, 'assets'> & {
  applications?: { key: string; name: string }[];
  teams: ConfigurationRecord[];
};

export const GranularSlaPolicyModal = ({
  defaultPolicy,
  existingPolicies = [],
  onSubmit,
  onClose,
}: GranularSlaPolicyModalProps) => {
  const { orgTeamProfiles } = useInject();
  const teamConfigurationRecords = useSuspense(orgTeamProfiles.getTeamHierarchyChart);

  const defaultValues = useMemo<Partial<GranulatedSlaPolicyFormValues> | null>(
    () =>
      convertGranularSlaPolicyToFormValues(
        defaultPolicy,
        existingPolicies,
        teamConfigurationRecords
      ),
    [defaultPolicy, existingPolicies, teamConfigurationRecords]
  );

  const validateDuplicatedPolicies = useCallback(
    (value: string) =>
      existingPolicies
        .filter(policy => policy.key !== defaultPolicy.key)
        .every(policy => policy.name !== value.trim()) ||
      'This SLA policy name is already in use. Choose a unique name for your  SLA policy.',
    [existingPolicies, defaultPolicy]
  );

  const handleSubmit = useCallback<OnSubmitFunction<GranulatedSlaPolicyFormValues>>(
    ({ slaConfiguration, teams, applications, name, ...formValue }, { setError }) => {
      if (isEmptyDeep(slaConfiguration)) {
        setError('slaConfiguration', emptySlaPolicyError);
        return;
      }

      const assets = applications ?? teams;

      onSubmit({
        ...formValue,
        name: name.trim(),
        assets,
        slaConfiguration: entries(slaConfiguration).reduce(
          (configuration, [key, value]) => ({
            ...configuration,
            [key]: !value ? undefined : parseInt(value.toString()),
          }),
          {} as SlaPolicyDefinition
        ),
      });
    },
    [onSubmit]
  );

  return (
    <GranularModal
      confirmOnClose
      title="Specific SLA policy"
      submitText="Apply"
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      onClose={onClose}>
      <FormLayoutV2.Label required>
        <Heading5>Policy name</Heading5>
        <InputControl
          name="name"
          placeholder="Type to enter policy name"
          rules={{ required: true, validate: validateDuplicatedPolicies }}
        />
      </FormLayoutV2.Label>
      <ApplicationsScopeContainer>
        <FormLayoutV2.Label required>
          <Heading5>Assets scope</Heading5>
        </FormLayoutV2.Label>

        {defaultPolicy.policyType === 'Application' ? <ApplicationsScope /> : <TeamsScope />}
      </ApplicationsScopeContainer>

      <SlaPolicyControl namePrefix="slaConfiguration" />
      <Caption1>
        <SvgIcon name="Info" size={Size.XXSMALL} />
        SLA must be a value between 1 to 365
      </Caption1>
    </GranularModal>
  );
};

const GranularModal = styled(ConfirmationModal)`
  width: 240rem;

  ${Modal.Content} {
    display: flex;
    flex-direction: column;
    gap: 4rem;
    font-size: var(--font-size-s);

    ${SlaPolicyControl} {
      flex: 1;
      width: 50%;
    }

    ${Caption1} {
      display: flex;
      align-items: center;
      gap: 1rem;
      color: var(--color-blue-gray-55);
    }
  }
`;
