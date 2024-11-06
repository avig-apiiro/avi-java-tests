import { observer } from 'mobx-react';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { Page } from '@src-v2/components/layout/page';
import { GeneralSettingsForm } from '@src-v2/containers/pages/general-settings/general-settings-form';
import { MonitorDesignRisks } from '@src-v2/containers/pages/general-settings/monitor-design-risks';
import { ProvidersPreferences } from '@src-v2/containers/pages/general-settings/providers-preferences';
import { RiskScore } from '@src-v2/containers/pages/general-settings/risk-score/risk-score';
import { GranularSlaPolicySection } from '@src-v2/containers/pages/general-settings/sla/granular/granular-sla-policy-section';
import { SLAPolicy } from '@src-v2/containers/pages/general-settings/sla/sla-policy';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export const GeneralSettings = observer(() => {
  const { application } = useInject();
  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'Settings' }}>
      <Page title="General settings">
        <GeneralSettingsForm location="/settings/general">
          <FormLayoutV2.HorizontalDivider>SLA preferences</FormLayoutV2.HorizontalDivider>
          <SLAPolicy />
          {application.isFeatureEnabled(FeatureFlag.GranularSLA) && (
            <FormLayoutV2.Section>
              <AsyncBoundary>
                <GranularSlaPolicySection />
              </AsyncBoundary>
            </FormLayoutV2.Section>
          )}

          {application.isFeatureEnabled(FeatureFlag.RiskScore) && (
            <>
              <FormLayoutV2.HorizontalDivider>
                Risk Scoring preferences
              </FormLayoutV2.HorizontalDivider>
              <RiskScore />
            </>
          )}

          {application.isFeatureEnabled(FeatureFlag.ScaProviderOrder) && (
            <>
              <FormLayoutV2.HorizontalDivider>
                SCA source preferences
              </FormLayoutV2.HorizontalDivider>
              <ProvidersPreferences />
            </>
          )}

          {application.isFeatureEnabled(FeatureFlag.DesignRisksV3) && <MonitorDesignRisks />}
        </GeneralSettingsForm>
      </Page>
    </AnalyticsLayer>
  );
});
