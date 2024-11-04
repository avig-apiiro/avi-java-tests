import { observer } from 'mobx-react';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { Page } from '@src-v2/components/layout/page';
import { GeneralSettingsForm } from '@src-v2/containers/pages/general-settings/general-settings-form';
import { GranularSlaPolicySection } from '@src-v2/containers/pages/general-settings/sla/granular/granular-sla-policy-section';
import { SLAPolicy } from '@src-v2/containers/pages/general-settings/sla/sla-policy';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export const SlaSettingsPage = observer(() => {
  const { application } = useInject();
  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'SLA' }}>
      <Page title="General settings">
        <GeneralSettingsForm location="/settings/sla">
          <SLAPolicy />
          {application.isFeatureEnabled(FeatureFlag.GranularSLA) && (
            <FormLayoutV2.Section>
              <AsyncBoundary>
                <GranularSlaPolicySection />
              </AsyncBoundary>
            </FormLayoutV2.Section>
          )}
        </GeneralSettingsForm>
      </Page>
    </AnalyticsLayer>
  );
});
