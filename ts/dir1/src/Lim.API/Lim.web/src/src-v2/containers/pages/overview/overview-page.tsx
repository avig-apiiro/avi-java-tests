import { observer } from 'mobx-react';
import { useCallback } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { usePaneState } from '@src-v2/components/panes/pane-context-provider';
import {
  LearningButton,
  LearningPane,
  LearningStatistics,
} from '@src-v2/containers/learning-stats';
import { ConnectorsHeader } from '@src-v2/containers/overview/tiles/connectors-header/connectors-header';
import { GeneralDashboardTilesLayout } from '@src-v2/containers/overview/tiles/general-dashboard-tiles-layout';
import ApisOverviewPage from '@src-v2/containers/pages/overview/apis-security-overview-page';
import { BaseOverviewPage } from '@src-v2/containers/pages/overview/base-overview-page';
import OssOverviewPage from '@src-v2/containers/pages/overview/oss-overview-page';
import SastOverviewPage from '@src-v2/containers/pages/overview/sast-overview-page';
import SecretsOverviewPage from '@src-v2/containers/pages/overview/secrets-overview-page';
import SupplyChainOverviewPage from '@src-v2/containers/pages/overview/supply-chain-overview-page';
import { useInject } from '@src-v2/hooks';

export default observer(() => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}/oss`}>
        <OssOverviewPage />
      </Route>
      <Route path={`${path}/secrets`}>
        <SecretsOverviewPage />
      </Route>
      <Route path={`${path}/api`}>
        <ApisOverviewPage />
      </Route>
      <Route path={`${path}/supplyChain`}>
        <SupplyChainOverviewPage />
      </Route>
      <Route path={`${path}/sast`}>
        <SastOverviewPage />
      </Route>

      <Route>
        <MainOverviewPage />
      </Route>
    </Switch>
  );
});

const MainOverviewPage = () => {
  const { overview, organization } = useInject();
  const { pushPane } = usePaneState();

  const handleOpenPane = useCallback(() => {
    pushPane(
      <LearningPane>
        <LearningStatistics dataFetcher={organization.getLearningStatistics} />
      </LearningPane>
    );
  }, [pushPane]);

  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'Overview dashboard' }}>
      <BaseOverviewPage
        title="Overview Dashboard"
        filtersFetcher={overview.getFilterOptions}
        header={<LearningButton onClick={handleOpenPane}>Learning statistics</LearningButton>}
        summary={<ConnectorsHeader />}>
        <GeneralDashboardTilesLayout showMultiAssetsTiles={true} />
      </BaseOverviewPage>
    </AnalyticsLayer>
  );
};
