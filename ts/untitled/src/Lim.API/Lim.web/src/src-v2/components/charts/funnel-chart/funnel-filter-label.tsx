import _ from 'lodash';
import { forwardRef } from 'react';
import styled from 'styled-components';
import { FilterInfoTooltip } from '@src-v2/components/charts/funnel-chart/funnel-filters-menu';
import { ClampText } from '@src-v2/components/clamp-text';
import { useFilters } from '@src-v2/hooks/use-filters';
import { FunnelDynamicFilterDefinition, FunnelFilterDefinition } from '@src-v2/services';
import { isTypeOf } from '@src-v2/utils/ts-utils';

const _FunnelFilterLabel = forwardRef<
  HTMLDivElement,
  {
    filter: FunnelFilterDefinition;
    showDescription?: boolean;
    isDisabled?: Boolean;
  }
>(({ filter, showDescription = false, isDisabled = false, ...props }, ref) => (
  <div ref={ref} {...props}>
    {isTypeOf<FunnelDynamicFilterDefinition>(filter, 'isDynamic') ? (
      <DynamicFilterLabel filter={filter} />
    ) : (
      <ClampText>{filter.label}</ClampText>
    )}
    {!isDisabled && showDescription && Boolean(filter.description) && (
      <FilterInfoTooltip filter={filter} />
    )}
  </div>
));

export const FunnelFilterLabel = styled(_FunnelFilterLabel)`
  max-width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

function DynamicFilterLabel({ filter }: { filter: FunnelDynamicFilterDefinition }) {
  const filterValues =
    useFilters().activeFilters?.[filter.tableFilterGroup ?? filter.tableFilter]?.values ??
    filter.values;

  const intersectedFilters = _.intersection(filter.possibleValuesFilterBy, filterValues);
  const labelsToDisplay = filter.possibleValuesFilterBy?.length
    ? intersectedFilters.length
      ? intersectedFilters
      : filter.possibleValuesFilterBy
    : filterValues;

  const label = filter.label.replace('$values', labelsToDisplay.join(', '));

  return <ClampText>{label}</ClampText>;
}
