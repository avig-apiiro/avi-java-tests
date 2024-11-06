import { observer } from 'mobx-react';
import { Button } from '@src-v2/components/button-v2';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Variant } from '@src-v2/components/types/enums/variant-enum';

export const BulkMonitorButton = observer(({ data, onClick, searchState }) => {
  const isAllMonitored = data.every(item => item.isMonitored);

  return (
    <Tooltip
      content={
        isAllMonitored ? 'Un-Monitor Selected Repositories' : 'Monitor Selected Repositories'
      }>
      <Button loading={searchState.loading} onClick={onClick} variant={Variant.SECONDARY}>
        {isAllMonitored ? 'Unmonitor' : 'Monitor'}
      </Button>
    </Tooltip>
  );
});
