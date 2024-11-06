import { BusinessImpact } from '@src-v2/types/enums/business-impact';
import { Provider } from '@src-v2/types/enums/provider';
import { ProviderGroup } from '@src-v2/types/enums/provider-group';
import { CodeProfileResponse } from '@src-v2/types/profiles/code-profile-response';
import { TagResponse } from '@src-v2/types/profiles/tags/profile-tag';

export class RepositoryProfileResponse extends CodeProfileResponse {
  isPublic: boolean;
  commitCount: number;
  provider: keyof typeof Provider;
  providerGroup: ProviderGroup;
  providerUrl: string;
  repositoryGroupId: string;
  badges: string[];
  tags: TagResponse[];
  isArchived: boolean;
  businessImpact: BusinessImpact;
  get profileType() {
    return RepositoryProfileResponse.profileType;
  }

  static profileType = 'repositories';
}

export interface RepositoryGroup {
  key: string;
  serverUrl: string;
  groupName: string;
  providerGroup: ProviderGroup;
}
