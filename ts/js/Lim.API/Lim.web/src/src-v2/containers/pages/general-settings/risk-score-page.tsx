import { observer } from 'mobx-react';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { Page } from '@src-v2/components/layout/page';
import { GeneralSettingsForm } from '@src-v2/containers/pages/general-settings/general-settings-form';
import { RiskScore } from '@src-v2/containers/pages/general-settings/risk-score/risk-score';

export const RiskScorePage = observer(() => {
  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'Risk score preferences' }}>
      <Page title="Risk Score">
        <GeneralSettingsForm location="/settings/risk-score">
          <RiskScore />
        </GeneralSettingsForm>
      </Page>
    </AnalyticsLayer>
  );
});
