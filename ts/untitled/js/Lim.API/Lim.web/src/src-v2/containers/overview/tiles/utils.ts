import _ from 'lodash';
import { useCallback } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useOverviewFilters } from '@src-v2/components/overview/use-overview-filters';
import { ActiveFilterData, ActiveFiltersData } from '@src-v2/hooks/use-filters';
import { DevPhase } from '@src-v2/types/enums/dev-phase';
import { OverviewLineItem } from '@src-v2/types/overview/overview-line-item';
import { makeUrl } from '@src-v2/utils/history-utils';
import { entries } from '@src-v2/utils/ts-utils';

type LineSeriesType = { [key: string]: OverviewLineItem[] };

export function isLineSeriesEmpty(series: LineSeriesType) {
  return entries(series).every(([, line]) => line.every(lineItem => !lineItem.count));
}

type MakeOverviewUrlParams = {
  baseUrl: string;
  query: Record<string, string | (string | number | Date)[] | ActiveFilterData>;
  customParams: {};
  devPhase: DevPhase;
};

export function useMakeOverviewUrl() {
  const { activeFilters } = useOverviewFilters();
  const { params: routeParams } =
    useRouteMatch<{ profileType: string }>('/profiles/:profileType/:profileKey') ?? {};

  return useCallback(
    ({
      baseUrl = '/risks',
      query,
      customParams = {},
      devPhase = DevPhase.Development,
    }: Partial<MakeOverviewUrlParams>) => {
      const filterQuery = entries(query).reduce(
        (result, [key, value]) => ({
          ...result,
          [key]: _.isArray(value) ? { values: value } : value,
        }),
        {}
      );

      if (routeParams?.profileType) {
        return makeUrl(`risk/${devPhase}`, {
          fl: filterQuery,
        });
      }

      return makeUrl(baseUrl, {
        fl: {
          ..._.omit(activeFilters, ['DashboardDateRange']),
          ...filterQuery,
        },
        ...customParams,
      });
    },
    [routeParams, activeFilters]
  );
}

export const getCoverageOverviewFilters = (filters: ActiveFiltersData) =>
  _.omit(filters, 'DashboardDateRange');
