import { observer } from 'mobx-react';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { Page } from '@src-v2/components/layout/page';
import { GeneralSettingsForm } from '@src-v2/containers/pages/general-settings/general-settings-form';
import { ProvidersPreferences } from '@src-v2/containers/pages/general-settings/providers-preferences';

export const ScaPreferencesPage = observer(() => {
  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'SCA Preferences' }}>
      <Page title="SCA Preferences">
        <GeneralSettingsForm location="/settings/sca-configuration">
          <ProvidersPreferences />
        </GeneralSettingsForm>
      </Page>
    </AnalyticsLayer>
  );
});
