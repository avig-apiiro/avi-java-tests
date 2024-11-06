import { ReactNode, createContext, useCallback, useContext, useMemo } from 'react';
import { useInject } from '@src-v2/hooks';
import { PartialRecord } from '@src-v2/types/partial-record';

export enum AnalyticsEventName {
  Filter = 'Filter',
  Search = 'Search',
  Pagination = 'Pagination',
  ActionClicked = 'Action Clicked',
  ExportClicked = 'Export Clicked',
  ActionInvoked = 'ActionInvoked',
  Loaded = 'Loaded',
}

export enum AnalyticsDataField {
  Context = 'Context',
  EntryPoint = 'Entry Point',
  PageName = 'Page Name',
  TimeToLoad = 'Time to load',
  TileName = 'Tile Name',
  DownloadTime = 'Download Time',
  RiskCategory = 'Risk Category',
  FilterType = 'Filter Type',
  ActionType = 'Action Type',
  ActionValue = 'Action Value',
  PageNumber = 'Page Number',
  ResultsPerPage = 'Results Per Page',
  ColumnName = 'Column Name',
  Source = 'Source',
  QueryName = 'Query Name',
  QueryType = 'QueryType',
  QueryLink = 'Query Link',
  NumberOfRisks = 'Number of Risks',
  ActionMode = 'Action Mode',
  IsEmpty = 'Is Empty',
  RiskLevel = 'Risk Level',
  OverridenRiskLevel = 'Overriden Risk Level',
  RiskStatus = 'Risk Status',
  OverridenRiskStatus = 'Overriden Risk Status',
  RuleName = 'Rule Name',
  FunnelDrawerState = 'Funnel Drawer State',
  FunnelBarKey = 'Funnel Bar Key',
  FunnelBarVisibilityChanged = 'Funnel Bar Visibility Changed',
  FunnelDividedBy = 'Funnel Divided By',
  FunnelReordered = 'Funnel Reordered',
  ReportingDashboard = 'Reporting Dashboard',
  DashboardName = 'Dashboard Name',
  CVEIdentifiers = 'CVE identifiers',
  ConnectorName = 'Connector name',
  ConnectorToggleName = 'Connector toggle',
  ScaProviderOrder = 'SCA provider order',
  ExposurePathNode = 'Node',
  ExposurePathExposure = 'Exposure',
  ExposureNodeLinkAction = 'Node link action',
}

const AnalyticsContext = createContext<Record<string, string>>({});

export function AnalyticsLayer({
  analyticsData,
  children,
}: {
  analyticsData: PartialRecord<AnalyticsDataField, string>;
  children: ReactNode;
}) {
  const parentContext = useAnalyticsData();

  const mergedContext = useMemo(() => {
    return { ...parentContext, ...analyticsData };
  }, [parentContext, analyticsData]);

  return <AnalyticsContext.Provider value={mergedContext}>{children}</AnalyticsContext.Provider>;
}

export function useTrackAnalytics() {
  const { analytics } = useInject();
  const parentAnalyticsData = useAnalyticsData();

  return useCallback(
    (
      eventName: AnalyticsEventName,
      analyticsData: PartialRecord<AnalyticsDataField, string> = {}
    ) => {
      analytics.track(eventName, {
        ...parentAnalyticsData,
        ...analyticsData,
      });
    },
    [parentAnalyticsData, analytics]
  );
}

export function useAnalyticsData() {
  return useContext(AnalyticsContext) ?? {};
}
