import { ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { ContributorsCard } from '@src-v2/components/entity-pane/remediation/contributors-card';
import { ExposurePathCard } from '@src-v2/containers/entity-pane/exposure-path/exposure-path-card';
import { AboutUserStoryRiskCard } from '@src-v2/containers/entity-pane/user-story/main-tab/about-user-story-risk-card';
import { AboutUserStoryRiskInsightsCard } from '@src-v2/containers/entity-pane/user-story/main-tab/about-user-story-risk-insights-card';
import { AboutUserStoryTicketCard } from '@src-v2/containers/entity-pane/user-story/main-tab/about-user-story-ticket-card';
import { useUserStoryPaneContext } from '@src-v2/containers/entity-pane/user-story/use-user-story-pane-context';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export function UserStoryMainTab(props: ControlledCardProps) {
  const { application } = useInject();
  const { risk } = useUserStoryPaneContext();

  const shouldShowExposurePathRiskyTickets =
    application.isFeatureEnabled(FeatureFlag.PocExposurePathRiskyTickets) &&
    risk.riskType === 'Issue';

  return (
    <>
      <AboutUserStoryRiskCard {...props} />
      <AboutUserStoryRiskInsightsCard {...props} />
      <AboutUserStoryTicketCard {...props} />
      {shouldShowExposurePathRiskyTickets && <ExposurePathCard {...props} />}
      {!risk && <ContributorsCard />}
    </>
  );
}
