import { ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import {
  AboutThisUserCard,
  UserActionType,
} from '@src-v2/containers/entity-pane/inactive-user/main-tab/about-this-user-card';
import { ContributorActivityTab } from '@src-v2/containers/entity-pane/inactive-user/main-tab/contributor-activity-tab';
import { useContributorNotPushingCodeContext } from '@src-v2/containers/entity-pane/inactive-user/use-contributor-not-pushing-code-pane-context';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export function InactiveEvidenceContributorTab(props: ControlledCardProps) {
  const { element, risk } = useContributorNotPushingCodeContext();
  const { application } = useInject();

  return (
    <>
      <AboutThisUserCard
        {...props}
        risk={risk}
        userType="Contributor"
        developerKey={element.developerKey}
        lastActionTime={element.lastCommitTime}
        actionType={UserActionType.Commit}
      />
      {application.isFeatureEnabled(FeatureFlag.ContributorActivityGraph) && (
        <ContributorActivityTab {...props} />
      )}
    </>
  );
}
