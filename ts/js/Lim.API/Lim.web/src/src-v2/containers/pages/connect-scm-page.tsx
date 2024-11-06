import _ from 'lodash';
import { observer } from 'mobx-react';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { NoScmConnectedLayout } from '@src-v2/components/layout/first-time-layouts/no-scm-connected/no-scm-connected-layout';
import { Page } from '@src-v2/components/layout/page';
import { useInject } from '@src-v2/hooks';

export default observer(() => {
  const { application } = useInject();

  if (_.isNil(application.integrations)) {
    return null;
  }

  return (
    <Page title="Connect SCM">
      <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'Connect SCM' }}>
        <NoScmConnectedLayout />
      </AnalyticsLayer>
    </Page>
  );
});
