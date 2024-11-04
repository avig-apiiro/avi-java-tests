import { useCallback } from 'react';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';

export const useTrackFilterAnalytics = () => {
  const trackAnalytics = useTrackAnalytics();

  return useCallback(
    filterTitle =>
      trackAnalytics(AnalyticsEventName.Filter, {
        [AnalyticsDataField.FilterType]: filterTitle,
      }),
    []
  );
};
