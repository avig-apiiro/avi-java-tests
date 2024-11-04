import { useParams } from 'react-router-dom';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { Page } from '@src-v2/components/layout/page';
import { ManualFindingCreationForm } from '@src-v2/containers/manual-findings/form/manual-finding-creation-form';

export const ManualFindingsForm = () => {
  const { key } = useParams<{ key?: string }>();

  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'Manual findings form' }}>
      <Page title={`${key ? 'Edit' : 'Create'} finding`}>
        <ManualFindingCreationForm />
      </Page>
    </AnalyticsLayer>
  );
};
