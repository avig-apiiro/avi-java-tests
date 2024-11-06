import { Provider } from '@src-v2/types/enums/provider';
import { RiskLevel } from '@src-v2/types/enums/risk-level';
import { RelatedEntityProfile } from '@src-v2/types/profiles/related-entity-profile';
import { RepositoryProjectProfile } from '@src-v2/types/profiles/repository-project-profile';

export class ProjectProfile {
  key: string;
  name: string;
  openIssuesCount: number;
  issuesCount: number;
  provider: keyof typeof Provider;
  containingRiskLevel: (keyof typeof RiskLevel)[];
  url: string;

  get profileType() {
    return ProjectProfile.profileType;
  }

  static profileType = 'projects';
}

export type RelatedProjectProfileResponse = RelatedEntityProfile<
  ProjectProfile,
  RepositoryProjectProfile
>;
