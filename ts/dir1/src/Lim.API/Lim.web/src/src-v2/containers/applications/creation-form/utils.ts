import _ from 'lodash';
import { ApplicationFormValues } from '@src-v2/containers/applications/creation-form/application-form-values';
import { CommunicationChannelResult } from '@src-v2/containers/organization-teams/creation-form/communication-channels/communication-configurations-field';
import { isTicketingProvider } from '@src-v2/containers/organization-teams/creation-form/communication-channels/target-select-control';
import { PointsOfContactOptions } from '@src-v2/containers/profiles/points-of-contacts-fields';
import { MessagingChannelResponse } from '@src-v2/services';
import { ProviderGroup } from '@src-v2/types/enums/provider-group';
import {
  EnrichedApplicationConfigurationResponse,
  FlatApplicationProfile,
} from '@src-v2/types/profiles/application-profile-response';
import { ProjectProfile } from '@src-v2/types/profiles/project-profile';
import { isEmptyDeep } from '@src-v2/utils/object-utils';
import { entries, isTypeOf } from '@src-v2/utils/ts-utils';

export function convertAppConfigurationToFormValues(
  {
    pointsOfContact,
    isInternetFacing,
    communicationProjectConfigurations,
    communicationChannelToProvider,
    ...configuration
  }: EnrichedApplicationConfigurationResponse,
  messagingChannelsToProvider: Record<ProviderGroup, MessagingChannelResponse[]>
): ApplicationFormValues {
  const groupedPointsOfContact = _.groupBy(pointsOfContact, 'jobTitle');

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
    isInternetFacing: isInternetFacing ? 'Yes' : 'No',
    pointsOfContact: entries(groupedPointsOfContact).map(([jobTitle, developers]) => ({
      developer: developers,
      jobTitle: { value: jobTitle, label: PointsOfContactOptions[jobTitle] },
    })),
    communicationConfigurations,
  };
}

export function convertFormValuesToFlatApplicationProfile({
  pointsOfContact,
  repositoryTags = [],
  repositories = [],
  projects = [],
  complianceRequirements = [],
  isInternetFacing,
  apiGateways: apiGatewayConfigurations = [],
  modules = [],
  modulesRepository,
  communicationConfigurations,
  ...formValues
}: ApplicationFormValues): FlatApplicationProfile {
  const apiGateways = apiGatewayConfigurations.filter(
    config => Boolean(config.gateway) && Boolean(config.gatewayRoute)
  );

  const [projectConfigurations, channelConfigurations] = _.partition(
    communicationConfigurations
      ?.filter(config => !isEmptyDeep(config))
      .map(({ provider, target }) => ({
        provider: provider.key,
        target: isTypeOf<ProjectProfile>(target, 'key') ? target.key : target.id,
      })),
    ({ provider }) => isTicketingProvider(provider)
  );

  let modulesGroup: FlatApplicationProfile['modulesGroup'] = null;
  if (modules?.length && modulesRepository) {
    const modulesRoots = modules.map(module => module.root);

    modulesGroup = {
      repositoryKey: modulesRepository.key,
      moduleKeys: modulesRoots.filter(
        root => !modulesRoots.some(otherRoot => otherRoot !== root && root.includes(otherRoot))
      ),
    };
  }

  return {
    ...formValues,
    isInternetFacing: isInternetFacing === 'Yes',
    key: formValues.key ?? crypto.randomUUID(),
    projectKeys: projects.map(project => project.key),
    repositoryKeys: repositories.map(repository => repository.key),
    modulesGroup,
    businessImpact: formValues.businessImpact?.value,
    deploymentLocation: formValues.deploymentLocation?.value,
    applicationType: formValues.applicationType?.value,
    estimatedUsersNumber: formValues.estimatedUsersNumber?.value,
    estimatedRevenue: formValues.estimatedRevenue?.value,
    associatedRepositoryTags: repositoryTags,
    complianceRequirements: complianceRequirements.map(option => option.value),
    apiGatewayKeys: apiGateways.filter(api => !_.isEmpty(api)).map(({ gateway }) => gateway.key),
    apisGroupKeys: apiGateways
      .filter(api => !_.isEmpty(api))
      .map(({ gatewayRoute }) => gatewayRoute.key),
    communicationChannelToProvider: channelConfigurations.reduce(
      communicationConfigurationsReducer,
      {} as Record<ProviderGroup, string>
    ),
    communicationProjectKeyToProvider: projectConfigurations.reduce(
      communicationConfigurationsReducer,
      {} as Record<ProviderGroup, string>
    ),
    pointsOfContact: pointsOfContact?.flatMap(({ developer, jobTitle }) =>
      developer.map(item => ({
        representativeIdentityKeySha: item.identityKey,
        title: jobTitle.value,
      }))
    ),
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
