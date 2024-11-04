import { LeanDeveloper } from '@src-v2/types/profiles/lean-developer';

export interface DeveloperProfileResponse extends LeanDeveloper {
  commitsCount: number;
  authoredPullRequestsCount: number;
  reviewedPullRequestsCount: number;
  activeSince: Date;
  lastActivity: Date;
}
