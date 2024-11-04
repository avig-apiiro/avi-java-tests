import { MonoRepo } from '@src-v2/containers/applications/creation-form/sections/mono-repo-section';
import { CommunicationChannelResult } from '@src-v2/containers/organization-teams/creation-form/communication-channels/communication-configurations-field';
import { AssetsConfiguration } from '@src-v2/containers/profiles/asset-selection-modal/assets-configuration-selection-modal';
import { ConfigurationAssetOption, DescriptionOption } from '@src-v2/types/app-creation-options';
import { BusinessImpact } from '@src-v2/types/enums/business-impact';
import { CodeModule } from '@src-v2/types/profiles/code-module';
import { LeanDeveloper } from '@src-v2/types/profiles/lean-developer';
import { TagResponse } from '@src-v2/types/profiles/tags/profile-tag';

export type ApplicationFormValues = {
  key?: string;
  name: string;
  tags: TagResponse[];

  // Modules section
  modulesRepository: MonoRepo;
  modules?: CodeModule[];

  // Additional settings section
  applicationType: DescriptionOption;
  applicationTypeOther?: string;
  deploymentLocation?: DescriptionOption;
  entryPoints: { url: string; name: string }[];
  pointsOfContact?: { developer: LeanDeveloper[]; jobTitle: { value: string; label: string } }[];

  // Security section
  isInternetFacing: 'Yes' | 'No';
  complianceRequirements: DescriptionOption[];
  apiGateways: { gateway: ConfigurationAssetOption; gatewayRoute: ConfigurationAssetOption }[];

  // Business impact section
  businessImpact: { value: BusinessImpact; label: BusinessImpact };
  businessUnit: string;
  estimatedUsersNumber: DescriptionOption;
  estimatedRevenue: DescriptionOption;
  communicationConfigurations?: CommunicationChannelResult[];
} & Partial<
  Pick<AssetsConfiguration, 'repositories' | 'projects' | 'repositoryGroups' | 'repositoryTags'>
>;
