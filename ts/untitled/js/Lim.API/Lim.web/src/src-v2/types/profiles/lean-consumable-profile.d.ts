import { CodeParsingTarget } from '@src-v2/types/code-parsing-target';
import { BusinessImpact } from '@src-v2/types/enums/business-impact';
import { ProfileType } from '../../enums/profileType';
import { ProviderGroup } from '../../enums/providerGroup';

interface Module {
  name: string;
  key: string;
  root: string;
  repositoryKey: string | null;
  type: string;
  types: string[];
  isSensitive: boolean;
  languages: string[];
}

export interface LeanConsumableProfile {
  key: string;
  name: string;
  serverUrl: string;
  url: string;
  repositoryName: string;
  referenceName: string;
  businessImpact: BusinessImpact;
  vendor: ProviderGroup;
  type: ProfileType;
  repositoryGroupId?: string;
  isActive: boolean;
  activeSince?: string;
  lastActivity?: string;
  provider?: string;
  modules: Module[];
}

export interface LeanCodeProfile extends LeanConsumableProfile {
  validationCodeParsingTargets: CodeParsingTarget[];
}
