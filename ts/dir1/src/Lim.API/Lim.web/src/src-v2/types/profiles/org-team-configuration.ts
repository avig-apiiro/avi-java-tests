import { ProviderGroup } from '@src-v2/types/enums/provider-group';
import { FlatAssetCollectionProfile } from '@src-v2/types/profiles/application-profile-response';
import {
  LeanApplication,
  LeanApplicationWithPointsOfContact,
} from '@src-v2/types/profiles/lean-application';
import { ProjectProfile } from '@src-v2/types/profiles/project-profile';
import { FindingTag, TagResponse } from '@src-v2/types/profiles/tags/profile-tag';

export interface OrgTeamConfiguration extends LeanApplicationWithPointsOfContact {
  description: string;
  parentKey?: string;
  tags: TagResponse[];
  applications: LeanApplication[];
  applicationTags: TagResponse[];
  repositoryTags: TagResponse[];
  findingTags?: FindingTag[];
  communicationChannelToProvider?: Record<ProviderGroup, string>;
  communicationProjectConfigurations?: ProjectProfile[];
}

export interface FlatOrgTeamConfiguration extends FlatAssetCollectionProfile {
  parentKey?: string;
  applicationKeys?: string[];
  associatedApplicationTags?: TagResponse[];
  associatedRepositoryTags?: TagResponse[];
  findingTags?: FindingTag[];
  communicationChannelToProvider?: Record<ProviderGroup, string>;
  communicationProjectKeyToProvider?: Record<ProviderGroup, string>;
  source?: string;
  externalIdentifier?: string;
  currentStateHash?: string;
}
