import { observer } from 'mobx-react';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { Page } from '@src-v2/components/layout/page';
import { GeneralSettingsForm } from '@src-v2/containers/pages/general-settings/general-settings-form';
import { MonitorDesignRisks } from '@src-v2/containers/pages/general-settings/monitor-design-risks';

export const MonitorDesignRisksPage = observer(() => {
  return (
    <AnalyticsLayer
      analyticsData={{ [AnalyticsDataField.Context]: 'Monitor design risks preferences' }}>
      <Page title="Monitor Design Risks">
        <GeneralSettingsForm location="/settings/monitor-design-risks">
          <MonitorDesignRisks />
        </GeneralSettingsForm>
      </Page>
    </AnalyticsLayer>
  );
});
