import { BusinessImpact } from '@src-v2/types/enums/business-impact';
import { SlaProfileResponse } from '@src-v2/types/profiles/application-profile-response';
import { CodeProfileResponse } from '@src-v2/types/profiles/code-profile-response';
import { LeanPointOfContact } from '@src-v2/types/profiles/lean-developer';

export class OrganizationTeamProfileResponse extends CodeProfileResponse {
  pointsOfContact: LeanPointOfContact[];
  description: string;
  applicationKeys: string[];
  repositoryKeys: string[];
  businessImpact: BusinessImpact;
  source: string;
  slaProfileResponse: SlaProfileResponse;

  get profileType() {
    return OrganizationTeamProfileResponse.profileType;
  }

  static profileType = 'org-teams';
}
