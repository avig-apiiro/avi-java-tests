import { useCallback } from 'react';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { Button } from '@src-v2/components/button-v2';
import { useOverviewTilesOrderContext } from '@src-v2/components/overview/overview-tiles-order-context';
import { Variant } from '@src-v2/components/types/enums/variant-enum';

export function ReorderTilesButton() {
  const trackAnalytics = useTrackAnalytics();
  const { isDirty, resetOrder } = useOverviewTilesOrderContext();

  const handleClearOrder = useCallback(() => {
    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.ActionType]: 'Base to default view',
    });

    resetOrder();
  }, [resetOrder, trackAnalytics]);

  return (
    isDirty && (
      <Button startIcon="Reset" onClick={handleClearOrder} variant={Variant.SECONDARY}>
        Reset view
      </Button>
    )
  );
}
