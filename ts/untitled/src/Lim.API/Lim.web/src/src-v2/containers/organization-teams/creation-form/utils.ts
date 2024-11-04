import _ from 'lodash';
import { CommunicationChannelResult } from '@src-v2/containers/organization-teams/creation-form/communication-channels/communication-configurations-field';
import { isTicketingProvider } from '@src-v2/containers/organization-teams/creation-form/communication-channels/target-select-control';
import { OrgTeamFormValues } from '@src-v2/containers/organization-teams/org-team-creation-form';
import { PointsOfContactOptions } from '@src-v2/containers/profiles/points-of-contacts-fields';
import { MessagingChannelResponse } from '@src-v2/services';
import { ConfigurationRecord } from '@src-v2/services/profiles/asset-collection-profiles-base';
import { ProviderGroup } from '@src-v2/types/enums/provider-group';
import {
  FlatOrgTeamConfiguration,
  OrgTeamConfiguration,
} from '@src-v2/types/profiles/org-team-configuration';
import { ProjectProfile } from '@src-v2/types/profiles/project-profile';
import { toArray } from '@src-v2/utils/collection-utils';
import { isEmptyDeep } from '@src-v2/utils/object-utils';
import { entries, isTypeOf } from '@src-v2/utils/ts-utils';

export function convertTeamProfileToFormValues(
  {
    key,
    name,
    description,
    pointsOfContact,
    parentKey,
    communicationChannelToProvider,
    communicationProjectConfigurations,
    ...configuration
  }: OrgTeamConfiguration,
  orgTeamRecords: ConfigurationRecord[],
  messagingChannelsToProvider: Record<ProviderGroup, MessagingChannelResponse[]>
): OrgTeamFormValues {
  const groupedPointsOfContact = _.groupBy(pointsOfContact, 'jobTitle');

  let parentTeamRecord: ConfigurationRecord = null;
  if (parentKey) {
    const teamsByKey = _.keyBy(orgTeamRecords, 'key');
    parentTeamRecord = teamsByKey[parentKey];
  }

  const communicationConfigurations: CommunicationChannelResult[] = [];

  if (communicationProjectConfigurations?.length) {
    communicationConfigurations.push(
      ...communicationProjectConfigurations.map(profile => ({
        provider: {
          key: profile.provider as ProviderGroup,
          label: profile.provider as ProviderGroup,
        },
        target: profile,
      }))
    );
  }
  if (!_.isEmpty(communicationChannelToProvider)) {
    communicationConfigurations.push(
      ...entries(communicationChannelToProvider).map(([provider, channelKey]) => {
        const target = messagingChannelsToProvider[provider].find(
          channel => channel.id === channelKey
        );

        return {
          provider: {
            key: provider,
            label: provider,
          },
          target,
        };
      })
    );
  }

  return {
    ...configuration,
    key,
    name,
    description,
    parentTeamRecord,
    pointsOfContact: entries(groupedPointsOfContact).map(([jobTitle, developers]) => ({
      developer: developers,
      jobTitle: {
        value: jobTitle,
        label: PointsOfContactOptions[jobTitle as keyof typeof PointsOfContactOptions],
      },
    })),
    communicationConfigurations,
  };
}

export function convertFormValuesToFlatTeamProfile({
  key = crypto.randomUUID(),
  name,
  description,
  parentTeamRecord,
  pointsOfContact,
  applications = [],
  repositories = [],
  repositoryGroups = [],
  projects = [],
  applicationTags,
  repositoryTags,
  findingTags,
  communicationConfigurations,
  tags,
  source,
  externalIdentifier,
  currentStateHash,
}: OrgTeamFormValues): FlatOrgTeamConfiguration {
  const [projectConfigurations, channelConfigurations] = _.partition(
    communicationConfigurations
      ?.filter(config => !isEmptyDeep(config))
      .map(({ provider, target }) => ({
        provider: provider.key,
        target: isTypeOf<ProjectProfile>(target, 'key') ? target.key : target.id,
      })),
    ({ provider }) => isTicketingProvider(provider)
  );

  return {
    key,
    name,
    description,
    parentKey: parentTeamRecord?.key,
    pointsOfContact: pointsOfContact.flatMap(({ developer, jobTitle }) =>
      toArray(developer).map(item => ({
        representativeIdentityKeySha: item.identityKey,
        title: jobTitle.value,
      }))
    ),
    applicationKeys: applications.map(({ key }) => key),
    repositoryKeys: repositories.map(({ key }) => key),
    projectKeys: projects.map(({ key }) => key),
    repositoryGroups,
    associatedApplicationTags: applicationTags,
    associatedRepositoryTags: repositoryTags,
    findingTags,
    communicationChannelToProvider: channelConfigurations.reduce(
      communicationConfigurationsReducer,
      {} as Record<ProviderGroup, string>
    ),
    communicationProjectKeyToProvider: projectConfigurations.reduce(
      communicationConfigurationsReducer,
      {} as Record<ProviderGroup, string>
    ),
    tags,
    source,
    externalIdentifier,
    currentStateHash,
  };
}

function communicationConfigurationsReducer(
  result: Record<ProviderGroup, string>,
  {
    provider,
    target,
  }: {
    provider: ProviderGroup;
    target: string;
  }
) {
  return { ...result, [provider]: target };
}
