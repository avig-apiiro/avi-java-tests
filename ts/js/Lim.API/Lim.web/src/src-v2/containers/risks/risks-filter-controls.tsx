import _ from 'lodash';
import { useMemo } from 'react';
import styled from 'styled-components';
import { Skeleton } from '@src-v2/components/animations/skeleton';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { FiltersControls } from '@src-v2/components/filters/inline-control/containers/filters-controls';
import { PlainFilterControlsContainer } from '@src-v2/components/filters/inline-control/containers/plain-filter-controls';
import { useRisksContext } from '@src-v2/containers/risks/risks-context';
import { useSuspense } from '@src-v2/hooks';
import { FiltersOptionsParams } from '@src-v2/services';

export function RisksFilterControls({
  params,
  namespace,
}: {
  params?: FiltersOptionsParams;
  namespace?: string;
}) {
  return (
    <AsyncBoundary pendingFallback={<PendingFilterControlsSkeleton />}>
      <InnerFilterControls params={params} namespace={namespace} />
    </AsyncBoundary>
  );
}

function InnerFilterControls({
  params,
  namespace,
}: {
  params?: FiltersOptionsParams;
  namespace?: string;
}) {
  const { risksService } = useRisksContext();
  const filterOptions = useSuspense(risksService.getFilterOptions, params);

  return <FiltersControls filterOptions={filterOptions} namespace={namespace} />;
}

function PendingFilterControlsSkeleton() {
  const widths = useMemo(() => _.range(5).map(() => Math.random() * 30 + 30), []);

  return (
    <PlainFilterControlsContainer>
      {widths.map(width => (
        <FilterSkeleton key={width} width={width} />
      ))}
    </PlainFilterControlsContainer>
  );
}

const FilterSkeleton = styled(Skeleton.Select)<{ width: number }>`
  width: ${props => `${props.width}rem`};
`;
