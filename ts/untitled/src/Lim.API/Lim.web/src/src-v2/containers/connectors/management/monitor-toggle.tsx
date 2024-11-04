import { observer } from 'mobx-react';
import { useCallback } from 'react';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { CheckboxToggle } from '@src-v2/components/forms';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';

export const MonitorToggle = observer(
  ({
    data,
    loading,
    disabled,
    onChange,
  }: {
    data: any;
    loading?: boolean;
    disabled?: boolean;
    onChange?: ({ key, shouldMonitor }: { key: string; shouldMonitor: boolean }) => void;
  }) => {
    const handleChange = useCallback(() => {
      onChange({
        key: data.key,
        shouldMonitor: !data.isMonitored,
      });
    }, [data, onChange]);

    return (
      <>
        <Tooltip
          content={data.isMonitored ? 'Currently being learned' : 'Currently not being learned'}>
          <CheckboxToggle
            checked={data.isMonitored}
            onChange={handleChange}
            disabled={loading || disabled}
          />
        </Tooltip>
        {loading && <LogoSpinner />}
      </>
    );
  }
);
