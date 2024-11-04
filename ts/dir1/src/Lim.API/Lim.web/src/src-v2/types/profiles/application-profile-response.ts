import { MonoRepo } from '@src-v2/containers/applications/creation-form/sections/mono-repo-section';
import { ConfigurationAssetOption, DescriptionOption } from '@src-v2/types/app-creation-options';
import { BusinessImpact } from '@src-v2/types/enums/business-impact';
import { ProviderGroup } from '@src-v2/types/enums/provider-group';
import { CodeModule } from '@src-v2/types/profiles/code-module';
import { CodeProfileResponse } from '@src-v2/types/profiles/code-profile-response';
import { LeanApplication } from '@src-v2/types/profiles/lean-application';
import { LeanConsumable } from '@src-v2/types/profiles/lean-consumable';
import { LeanPointOfContact } from '@src-v2/types/profiles/lean-developer';
import { ProjectProfile } from '@src-v2/types/profiles/project-profile';
import { RepositoryGroup } from '@src-v2/types/profiles/repository-profile-response';
import { TagResponse } from '@src-v2/types/profiles/tags/profile-tag';

export type SlaProfileResponse = {
  sla: {
    policyKey: string;
    policyName: string;
    riskLevel: string;
    slaDays: number | null;
  }[];
  isConfigured: boolean;
};

export class ApplicationProfileResponse extends CodeProfileResponse {
  description: string;
  tags: TagResponse[];
  isModuleBased?: boolean;
  pointsOfContact?: LeanPointOfContact[];
  slaProfileResponse: SlaProfileResponse;
  businessImpact: BusinessImpact;
  source: string;
  riskScore: number;

  get profileType() {
    return ApplicationProfileResponse.profileType;
  }

  static profileType = 'applications';
}

export interface EnrichedApplicationConfigurationResponse {
  key?: string;
  name: string;
  tags: TagResponse[];
  isModuleBased: boolean;

  // Assets section
  repositories?: LeanConsumable[];
  applications?: LeanApplication[];
  projects?: LeanConsumable[];
  repositoryGroups?: RepositoryGroup[];

  // Mono repo section
  modules?: CodeModule[];
  modulesRepository: MonoRepo;

  // Additional settings section
  applicationType: DescriptionOption;
  applicationTypeOther?: string;
  deploymentLocations: DescriptionOption;
  entryPoints: { url: string; name: string }[];
  pointsOfContact: LeanPointOfContact[];

  // Security section
  isInternetFacing: boolean;
  complianceRequirements: DescriptionOption[];
  apiGateways: { gateway: ConfigurationAssetOption; gatewayRoute: ConfigurationAssetOption }[];

  // Business impact section
  businessImpact: { value: BusinessImpact; label: BusinessImpact };
  businessUnit: string;
  estimatedUsersNumber: DescriptionOption;
  estimatedRevenue: DescriptionOption;

  source?: string;
  externalIdentifier?: string;
  currentStateHash?: string;

  //communication section

  communicationChannelToProvider?: Record<ProviderGroup, string>;
  communicationProjectConfigurations?: ProjectProfile[];
}

export interface PointOfContactConfiguration {
  representativeIdentityKeySha: string;
  title: string;
}

export interface FlatAssetCollectionProfile {
  key: string;
  name: string;
  description?: string;

  pointsOfContact?: PointOfContactConfiguration[];
  repositoryKeys?: string[];
  repositoryGroups?: RepositoryGroup[];
  projectKeys?: string[];

  tags: TagResponse[];
}

export interface FlatApplicationProfile extends FlatAssetCollectionProfile {
  businessImpact?: BusinessImpact;
  deploymentLocation?: string;
  applicationType?: string;
  complianceRequirements?: string[];
  apiGatewayKeys: string[];
  apisGroupKeys: string[];
  estimatedUsersNumber?: string;
  estimatedRevenue?: string;
  isInternetFacing?: boolean;
  associatedRepositoryTags?: TagResponse[];
  communicationChannelToProvider: Record<ProviderGroup, string>;
  communicationProjectKeyToProvider?: Record<ProviderGroup, string>;
  source?: string;
  externalIdentifier?: string;
  currentStateHash?: string;
  modulesGroup?: {
    repositoryKey: string;
    moduleKeys: string[];
  };
}
