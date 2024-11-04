import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { Gutters } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { PRLogsTable } from '@src-v2/containers/pr-logs/pr-logs-table';

export default () => {
  return (
    <Page title="PR logs">
      <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'PR logs' }}>
        <Gutters>
          <PRLogsTable />
        </Gutters>
      </AnalyticsLayer>
    </Page>
  );
};
