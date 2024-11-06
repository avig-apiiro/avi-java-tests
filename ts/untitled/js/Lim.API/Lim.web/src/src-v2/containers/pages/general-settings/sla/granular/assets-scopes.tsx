import { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { Chip } from '@src-v2/components/chips';
import { Radio } from '@src-v2/components/forms';
import { SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Strong } from '@src-v2/components/typography';
import { RadioLabel } from '@src-v2/containers/access-tokens/permissions/permissions-section';
import {
  TeamOption,
  filterConfigurationRecord,
} from '@src-v2/containers/organization-teams/heirarchy-team-select-utils';
import { GranulatedSlaPolicyFormValues } from '@src-v2/containers/pages/general-settings/sla/granular/granular-sla-policy-modal';
import { useInject, useSuspense } from '@src-v2/hooks';

const requiredErrorText = 'Define the scope for the SLA policy';

export const ApplicationsScope = () => {
  const { watch, setValue } = useFormContext<GranulatedSlaPolicyFormValues>();
  const { applicationProfilesV2 } = useInject();
  const [isByTags, setIsByTags] = useState<boolean>(Boolean(watch('tags')?.length));

  const handleManualMode = useCallback(() => {
    setIsByTags(false);
    setValue('tags', []);
  }, [setIsByTags, setValue]);

  const handleTagsMode = useCallback(() => {
    setIsByTags(true);
    setValue('applications', []);
  }, [setIsByTags, setValue]);

  return (
    <ApplicationsScopeContainer>
      <AssetsTypeRadioContainer>
        <RadioLabel>
          <Radio checked={!isByTags} onClick={handleManualMode} />
          Add manually
        </RadioLabel>
        <RadioLabel>
          <Radio checked={isByTags} onClick={handleTagsMode} />
          Add automatically by tags
          <InfoTooltip content="Custom application tags created by the user" />
        </RadioLabel>
      </AssetsTypeRadioContainer>

      {isByTags ? (
        <SelectControlV2
          multiple
          key="tags"
          name="tags"
          placeholder="Type to select application tags..."
          rules={{ required: requiredErrorText }}
          searchMethod={applicationProfilesV2.getAllFlatApplicationTags}
          formatOptionLabel={tag => (
            <>
              <Strong>{tag.name}</Strong> : {tag.value}
            </>
          )}
        />
      ) : (
        <SelectControlV2
          multiple
          key="applications"
          rules={{ required: requiredErrorText }}
          name="applications"
          placeholder="Type to select applications..."
          searchMethod={applicationProfilesV2.searchLeanApplications}
          formatOptionLabel={(option: any) => option.name}
        />
      )}
    </ApplicationsScopeContainer>
  );
};

export const ApplicationsScopeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AssetsTypeRadioContainer = styled.div`
  display: flex;
  gap: 4rem;
  margin-bottom: 1rem;
`;

export const TeamsScope = () => {
  const { orgTeamProfiles } = useInject();
  const orgTeamRecords = useSuspense(orgTeamProfiles.getTeamHierarchyChart);

  return (
    <TeamsScopeSelect
      multiple
      name="teams"
      rules={{ required: requiredErrorText }}
      placeholder="Type to select teams..."
      option={TeamOption}
      options={orgTeamRecords}
      filterOption={filterConfigurationRecord}
    />
  );
};

const TeamsScopeSelect = styled(SelectControlV2)`
  ${Chip} {
    max-width: 90rem;
  }
`;
