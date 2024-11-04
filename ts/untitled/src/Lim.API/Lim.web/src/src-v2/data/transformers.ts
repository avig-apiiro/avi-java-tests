import _ from 'lodash';
import { Filter } from '@src-v2/hooks/use-filters';
import { ProfileType } from '@src-v2/types/enums/profile-type';
import { LegacyFilterGroup } from '@src-v2/types/filters/legacy-filters';

export function transformFilterGroups(optionsGroup: LegacyFilterGroup): Filter {
  return {
    key: optionsGroup.name,
    type: optionsGroup.filterType,
    title: optionsGroup.displayName,
    isGrouped: optionsGroup.isGrouped,
    options: _.orderBy(optionsGroup.filterOptions, [
      'sortOrder',
      option => {
        return !option.hierarchy?.length
          ? option.displayName?.toLowerCase()
          : `${option.hierarchy
              .map(({ name }) => name.toLowerCase())
              .join('_')}_${option.displayName?.toLowerCase()}`;
      },
    ])
      .filter(item => item.name !== null && item.displayName !== null)
      .map(option => ({
        key: option.name,
        title: option.displayName,
        value: option.name,
        group: option.group ?? '',
        hierarchy: option.hierarchy,
        groupOrder: option.groupOrder ?? -1,
        sentiment: option.sentiment ?? '',
        description: option.description ?? '',
      })),
    defaultValue: optionsGroup.defaultValue,
    defaultValues: optionsGroup.defaultValues,
    isAdditional: optionsGroup.isAdditional,
    supportedOperators: _.orderBy(optionsGroup.supportedOperators, _.identity),
  };
}

export function transformProfileTypeToEndpoint(profileType: string | ProfileType) {
  switch (profileType) {
    case 'RepositoryProfile':
    case 'repository':
      return 'repositories';
    case 'ProjectProfile':
    case 'project':
      return 'projects';
    case 'ApplicationProfile':
    case 'assetCollection':
      return 'asset-collections/applications';
    default:
      return profileType;
  }
}

export function transformProfileEndpointToProfileType(
  profileEndpoint: string
): 'ApplicationProfile' | 'RepositoryProfile' {
  switch (profileEndpoint) {
    case 'applications':
      return 'ApplicationProfile';
    case 'repositories':
    default:
      return 'RepositoryProfile';
  }
}
