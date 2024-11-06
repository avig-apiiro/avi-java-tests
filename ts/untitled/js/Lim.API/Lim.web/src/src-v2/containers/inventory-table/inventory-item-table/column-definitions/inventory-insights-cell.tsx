import { InsightsCell } from '@src-v2/components/table/table-common-cells/insights-cell';
import { Insight } from '@src-v2/types/risks/insight';

export const InventoryInsightsCell = ({ insights, ...props }: { insights: Insight[] }) => (
  <InsightsCell {...props} insights={insights} filterKey="Insights" />
);
