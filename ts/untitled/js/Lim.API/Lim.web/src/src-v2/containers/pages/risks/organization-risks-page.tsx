import _ from 'lodash';
import { observer } from 'mobx-react';
import { useCallback } from 'react';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Dropdown } from '@src-v2/components/dropdown';
import { Gutters, StickyHeader } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { SelectMenu } from '@src-v2/components/select-menu';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Strong } from '@src-v2/components/typography';
import { AllRisksTable } from '@src-v2/containers/risks/all-risks/all-risks-table';
import { tableColumns } from '@src-v2/containers/risks/all-risks/all-risks-table-content';
import { RisksFunnel } from '@src-v2/containers/risks/funnels/risks-funnel';
import { RisksFunnelDataProvider } from '@src-v2/containers/risks/funnels/risks-funnel-data-provider';
import { RisksFunnelDrawer } from '@src-v2/containers/risks/funnels/risks-funnel-drawer';
import { RisksContext } from '@src-v2/containers/risks/risks-context';
import { risksFunnelColors } from '@src-v2/data/risks-funnel';
import { useInject, useQueryParams, useSuspense, useToggle } from '@src-v2/hooks';
import { useFilters } from '@src-v2/hooks/use-filters';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { StubAny } from '@src-v2/types/stub-any';
import { stopPropagation } from '@src-v2/utils/dom-utils';
import { entries } from '@src-v2/utils/ts-utils';

export default observer(() => {
  const { risks, application, allRisks } = useInject();
  const { updateFilters } = useFilters();
  const { queryParams, updateQueryParams } = useQueryParams();

  const [isDividingFunnelBySeverity, toggleIsDividingFunnelBySeverity] = useToggle(
    queryParams?.divideFunnelBy === 'severity'
  );

  const trackAnalytics = useTrackAnalytics();
  const riskCategoryToGroup = useSuspense(allRisks.getFunnelRiskCategoryToGroup);

  const handleSearchFunnel = useCallback(
    async (params: StubAny) => {
      const segments = await allRisks.searchFunneledRisksCount({
        ...params,
        bySeverity: isDividingFunnelBySeverity,
      });

      return isDividingFunnelBySeverity
        ? segments
        : groupRiskCategoriesFunnelData(segments, riskCategoryToGroup);
    },
    [allRisks, isDividingFunnelBySeverity]
  );

  const handleLegendClick = useCallback(
    (legend: string) => {
      const value = isDividingFunnelBySeverity
        ? [legend]
        : entries(riskCategoryToGroup)
            .filter(([, group]) => group === legend)
            .map(([category]) => category);

      updateFilters({
        key: isDividingFunnelBySeverity ? 'RiskLevel' : 'RiskCategory',
        value,
      });
    },
    [isDividingFunnelBySeverity, updateFilters]
  );

  const handleDivideByToggle = useCallback(() => {
    trackAnalytics(AnalyticsEventName.ActionInvoked, {
      [AnalyticsDataField.FunnelDividedBy]: isDividingFunnelBySeverity
        ? 'Risk severity'
        : 'Risk category',
    });
    updateQueryParams({ divideFunnelBy: isDividingFunnelBySeverity ? 'category' : 'severity' });
    toggleIsDividingFunnelBySeverity();
  }, [isDividingFunnelBySeverity, toggleIsDividingFunnelBySeverity]);

  return (
    <Page>
      <StickyHeader />
      <Gutters data-top-spacing>
        <AsyncBoundary>
          <RisksContext risksService={risks} title="All Risks" tableColumns={tableColumns}>
            {!application.isFeatureEnabled(FeatureFlag.DisableRisksFunnel) && (
              <RisksFunnelDataProvider storagePrefix="all_risks">
                <RisksFunnelDrawer
                  actions={
                    <SelectMenu
                      active
                      onClick={stopPropagation}
                      onItemClick={stopPropagation}
                      variant={Variant.FILTER}
                      placeholder={
                        <>
                          Segmented by:{' '}
                          <Strong>
                            {isDividingFunnelBySeverity ? 'Risk severity' : 'Risk category'}
                          </Strong>
                        </>
                      }>
                      <Dropdown.Item onClick={handleDivideByToggle}>
                        {isDividingFunnelBySeverity ? 'Risk category' : 'Risk severity'}
                      </Dropdown.Item>
                    </SelectMenu>
                  }>
                  <AsyncBoundary>
                    <RisksFunnel
                      suspendFilterOptions
                      dataFetcher={handleSearchFunnel}
                      colorsMapper={
                        isDividingFunnelBySeverity
                          ? risksFunnelColors.bySeverity
                          : risksFunnelColors.byCategory
                      }
                      onLegendClick={handleLegendClick}
                    />
                  </AsyncBoundary>
                </RisksFunnelDrawer>
              </RisksFunnelDataProvider>
            )}
            <AllRisksTable />
          </RisksContext>
        </AsyncBoundary>
      </Gutters>
    </Page>
  );
});

function groupRiskCategoriesFunnelData(
  funnelSegments: Record<string, number>[],
  riskCategoryToGroup: Record<string, string>
) {
  return funnelSegments.map(segment =>
    _.orderBy(
      entries(segment),
      ([category]) => {
        const group = riskCategoryToGroup[category];
        if (group === 'Toxic combinations') {
          return 2;
        }

        if (group === 'Other') {
          return 0;
        }

        return 1;
      },
      'desc'
    ).reduce<Record<string, number>>((result, [category, count]) => {
      const group = riskCategoryToGroup[category];
      return group
        ? {
            ...result,
            [group]: (result[group] ?? 0) + count,
          }
        : result;
    }, {})
  );
}
