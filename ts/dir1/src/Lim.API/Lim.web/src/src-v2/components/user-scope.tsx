import _ from 'lodash';
import { useCallback, useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { CheckboxToggle } from '@src-v2/components/forms';
import { SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { FormLayoutV2, InputClickableLabel } from '@src-v2/components/forms/form-layout-v2';
import { VendorIcon } from '@src-v2/components/icons';
import { RepositoryInfoTooltip } from '@src-v2/components/repositories/repository-info-tooltip';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Heading3, Heading5 } from '@src-v2/components/typography';
import { ExtendedUserScopeType } from '@src-v2/containers/access-tokens/access-token-form';
import {
  TeamOption,
  filterConfigurationRecord,
} from '@src-v2/containers/organization-teams/heirarchy-team-select-utils';
import { useInject, useSuspense, useToggle } from '@src-v2/hooks';
import { ConfigurationRecord } from '@src-v2/services/profiles/asset-collection-profiles-base';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export const SCOPE_FIELDS = [
  'userScope.applicationGroups',
  'userScope.assetCollections',
  'userScope.orgTeams',
  'userScope.providerRepositories',
  'userScope.servers',
];

export const UserScope = () => {
  const { application, applicationProfiles, orgTeamProfiles } = useInject();
  const [connectors, orgTeamRecords] = useSuspense([
    [applicationProfiles.getConnectors] as const,
    [orgTeamProfiles.getTeamHierarchyChart] as const,
  ]);
  const { watch, setValue } = useFormContext();
  const [
    applicationGroups,
    applications,
    selectedOrgTeams,
    providerRepositories,
    servers,
    isGlobal,
  ] = watch([...SCOPE_FIELDS, 'userScope.isGlobal']);

  const filterOrgTeam = useCallback(
    ({ data }: { data: ConfigurationRecord }, inputValue: string) =>
      filterConfigurationRecord({ data }, inputValue) &&
      (!selectedOrgTeams?.length ||
        !data.hierarchy.some(hierarchyRecord =>
          selectedOrgTeams.map(record => record.key).includes(hierarchyRecord.key)
        )),
    [selectedOrgTeams]
  );

  const [showScopeFields, toggleShowScopeFields] = useToggle(isGlobal === false);

  useEffect(() => {
    const customIsGlobal =
      !showScopeFields ||
      (!applicationGroups?.length &&
        !applications?.length &&
        !selectedOrgTeams?.length &&
        !providerRepositories?.length &&
        !servers?.length);

    setValue('userScope.isGlobal', customIsGlobal);
  }, [
    showScopeFields,
    applicationGroups,
    applications,
    selectedOrgTeams,
    providerRepositories,
    servers,
  ]);

  return (
    <FormLayoutV2.Section>
      <Heading3>Scope</Heading3>
      <CheckboxSubtitleContainer>
        <CheckboxToggle checked={showScopeFields} onChange={toggleShowScopeFields} />
        Limit access to specific assets
      </CheckboxSubtitleContainer>
      {showScopeFields && (
        <>
          <FormLayoutV2.Label>
            <Heading5>Application groups</Heading5>
            <SelectControlV2
              multiple
              name="userScope.applicationGroups"
              placeholder="Add groups"
              searchMethod={applicationProfiles.getApplicationGroupsConfigurations}
              formatOptionLabel={(option: any) => <>{option.name}</>}
            />
          </FormLayoutV2.Label>
          <FormLayoutV2.Label>
            <Heading5>Applications</Heading5>
            <SelectControlV2
              multiple
              name="userScope.assetCollections"
              placeholder="Add applications"
              searchMethod={applicationProfiles.getApplications}
              formatOptionLabel={(option: any) => option.name}
            />
          </FormLayoutV2.Label>
          {application.isFeatureEnabled(FeatureFlag.OrgTeams) && (
            <FormLayoutV2.Label>
              <Heading5>Teams</Heading5>
              <SelectControlV2
                multiple
                name="userScope.orgTeams"
                placeholder="Add teams"
                options={orgTeamRecords}
                option={TeamOption}
                label={SelectedTeamLabel}
                filterOption={filterOrgTeam}
              />
            </FormLayoutV2.Label>
          )}
          <FormLayoutV2.Label>
            <Heading5>Repositories</Heading5>
            <SelectControlV2
              multiple
              rules={{ pattern: /\S/ }}
              name="userScope.providerRepositories"
              placeholder="Add repositories"
              searchMethod={applicationProfiles.getProviderRepositories}
              option={({ data }) => (
                <Tooltip content={<RepositoryInfoTooltip item={data} />}>
                  <OptionContentContainer>
                    <VendorIcon
                      name={(
                        data.providerGroup ??
                        data.server.providerGroup ??
                        data.server.provider
                      ).toString()}
                    />{' '}
                    {data.name}
                  </OptionContentContainer>
                </Tooltip>
              )}
            />
          </FormLayoutV2.Label>

          <FormLayoutV2.Label>
            <Heading5>Connectors</Heading5>
            <SelectControlV2
              multiple
              name="userScope.servers"
              placeholder="Add connectors"
              rules={{ pattern: /\S/ }}
              options={connectors}
              option={({ data }) => (
                <OptionContentContainer>
                  <VendorIcon name={data.providerGroup} /> {data.name}
                </OptionContentContainer>
              )}
            />
          </FormLayoutV2.Label>
        </>
      )}
    </FormLayoutV2.Section>
  );
};

const CheckboxSubtitleContainer = styled(InputClickableLabel)`
  display: flex;
  align-items: center;
  font-size: var(--font-size-s);
  gap: 2rem;
  cursor: pointer;
`;

const OptionContentContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-grow: 1;
`;

export const transformUserScopeSubmitData = (data: { userScope: ExtendedUserScopeType }) => {
  const {
    applicationGroups = [],
    assetCollections = [],
    orgTeams = [],
    providerRepositories = [],
    servers = [],
  } = data.userScope;

  return data.userScope && !data.userScope.isGlobal
    ? {
        isGlobal: false,
        applicationGroupKeys: applicationGroups?.map(value => value.key),
        // TODO: key name is not mistake! BE has a typo, this will change once we update BE
        assesCollectionKeys: assetCollections.concat(orgTeams)?.map(value => value.key),
        providerRepositoryKeys: providerRepositories?.map(value => value.key),
        serverKeys: servers?.map(value => value.key),
      }
    : { isGlobal: true };
};

const SelectedTeamLabel = ({ data }: { data: ConfigurationRecord }) => {
  const { orgTeamProfiles } = useInject();
  const orgTeamRecords = useSuspense(orgTeamProfiles.getTeamHierarchyChart);

  const teamChildrenNames = useMemo(
    () =>
      _.orderBy(
        orgTeamRecords?.filter(
          record =>
            record.key !== data.key &&
            record.hierarchy?.some(parentRecord => parentRecord.key === data.key)
        ),
        record => record.hierarchy?.length
      )
        .map(record => record.name)
        .join(', '),
    [data, orgTeamRecords]
  );

  return (
    <Tooltip
      disabled={!teamChildrenNames}
      content={
        <>
          This team also includes the following teams:
          <br />
          {teamChildrenNames}
        </>
      }>
      <OptionContentContainer>
        <TeamOption data={data} />
      </OptionContentContainer>
    </Tooltip>
  );
};
