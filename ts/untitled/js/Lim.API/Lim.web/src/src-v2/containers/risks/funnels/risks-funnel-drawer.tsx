import {
  FunnelDrawer,
  FunnelDrawerProps,
} from '@src-v2/components/charts/funnel-chart/funnel-drawer';

export const RisksFunnelDrawer = (props: Omit<FunnelDrawerProps, 'defaultItemLabel'>) => (
  <FunnelDrawer {...props} defaultItemLabel="Open risks" />
);
