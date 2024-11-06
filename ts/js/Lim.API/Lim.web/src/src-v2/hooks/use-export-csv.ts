import { AxiosResponse } from 'axios';
import { useCallback } from 'react';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { useLoading } from '@src-v2/hooks/use-loading';
import { downloadFile } from '@src-v2/utils/dom-utils';

export function useExportCsv(request: () => Promise<AxiosResponse>) {
  const trackAnalytics = useTrackAnalytics();

  const handleExport = useCallback(async () => {
    const startTime = Date.now();
    const { headers, data } = await request();

    const [, filename] = headers['content-disposition'].match(/filename=([^;]+);/);
    downloadFile(filename, data, 'text/csv');

    trackAnalytics(AnalyticsEventName.ExportClicked, {
      [AnalyticsDataField.DownloadTime]: ((Date.now() - startTime) / 1000).toString(),
    });
  }, [request, trackAnalytics]);

  return useLoading(handleExport);
}
