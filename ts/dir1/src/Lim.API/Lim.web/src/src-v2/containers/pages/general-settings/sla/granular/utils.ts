import _ from 'lodash';
import { GranulatedSlaPolicyFormValues } from '@src-v2/containers/pages/general-settings/sla/granular/granular-sla-policy-modal';
import { GranulatedSlaPolicyDefinition } from '@src-v2/services';
import { ConfigurationRecord } from '@src-v2/services/profiles/asset-collection-profiles-base';

export const convertGranularSlaPolicyToFormValues = (
  defaultPolicy: Partial<GranulatedSlaPolicyDefinition>,
  existingPolicies: GranulatedSlaPolicyDefinition[],
  teamConfigurationRecords: ConfigurationRecord[]
): Partial<GranulatedSlaPolicyFormValues> => {
  if (!defaultPolicy) {
    return null;
  }

  const { assets, name: policyName, ...policy } = defaultPolicy;

  const name = policyName ?? prePopulateName(policy.policyType, existingPolicies);
  if (policy.policyType === 'Application') {
    return { ...policy, name, applications: assets };
  }

  const teamsByKey = _.keyBy(teamConfigurationRecords, 'key');
  return {
    ...policy,
    name,
    teams: assets?.map(({ key }) => teamsByKey[key]),
  };
};

function prePopulateName(
  policyType: GranulatedSlaPolicyDefinition['policyType'],
  policies: GranulatedSlaPolicyDefinition[]
) {
  const baseName = `${policyType === 'OrgTeam' ? 'Team' : 'Application'} SLA`;

  if (!policies.some(policy => policy.name === baseName)) {
    return baseName;
  }

  const maxIndex = Math.max(
    ...policies.map(({ name }) => {
      const match = name.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    })
  );

  return `${baseName} (${maxIndex + 1})`;
}
