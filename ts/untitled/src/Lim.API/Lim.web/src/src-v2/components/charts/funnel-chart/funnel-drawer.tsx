import { ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { FunnelFiltersMenu } from '@src-v2/components/charts/funnel-chart/funnel-filters-menu';
import { Collapsible } from '@src-v2/components/collapsible';
import { Strong } from '@src-v2/components/typography';
import { StyledProps } from '@src-v2/types/styled';

export type FunnelDrawerProps = StyledProps & {
  defaultItemLabel: string;
  actions?: ReactNode;
};

export const FunnelDrawer = styled(
  ({ actions, defaultItemLabel, children, ...props }: FunnelDrawerProps) => {
    const trackAnalytics = useTrackAnalytics();

    const drawerToggle = useCallback(
      (isOpen: Boolean) => {
        trackAnalytics(AnalyticsEventName.ActionClicked, {
          [AnalyticsDataField.FunnelDrawerState]: isOpen ? 'Open' : 'Closed',
        });
      },
      [trackAnalytics]
    );

    return (
      <Collapsible
        {...props}
        defaultOpen
        onToggle={drawerToggle}
        title="Contextual prioritization funnel"
        actions={
          <ActionsContainer>
            {actions}
            <FunnelFiltersMenu defaultItemLabel={defaultItemLabel} />
          </ActionsContainer>
        }>
        <DrawerBody>{children}</DrawerBody>
      </Collapsible>
    );
  }
)`
  ${Collapsible.Head} {
    justify-content: flex-start;
    align-items: center;
    gap: 2rem;

    ${Collapsible.Title} {
      width: fit-content;
      font-size: var(--font-size-m);
      font-weight: 500;
      line-height: 8rem;
      color: var(--color-blue-gray-60);
      cursor: pointer;
      transition: color 200ms ease-in-out;

      &:hover {
        color: var(--color-blue-gray-70);
        text-decoration: underline;
      }
    }
  }

  ${Strong} {
    font-weight: 600;
  }
`;

const DrawerBody = styled.div`
  margin: 3rem 0 2rem;
`;

const ActionsContainer = styled.div`
  display: flex;
  margin-left: auto;
  gap: 2rem;
`;
