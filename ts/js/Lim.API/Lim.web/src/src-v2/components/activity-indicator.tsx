import { ReactNode, forwardRef } from 'react';
import styled from 'styled-components';
import { TippyAttributes } from '@src-v2/components/tooltips/tippy';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { useGroupProperties } from '@src-v2/hooks';
import { RiskStatus } from '@src-v2/types/enums/risk-level';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

interface ActivityIndicatorProps {
  active: boolean;
  content?: ReactNode;
  size?: Size.SMALL | Size.XSMALL;
}

export const ActivityIndicator = styled(
  forwardRef<HTMLSpanElement, StyledProps<ActivityIndicatorProps>>(
    ({ size = Size.XSMALL, active, ...props }, ref) => {
      const [tippyProps, { ...restProps }] = useGroupProperties(props, TippyAttributes);
      return (
        <Tooltip {...tippyProps} ref={ref} disabled={!tippyProps.content || tippyProps.disabled}>
          <span {...restProps} data-active={dataAttr(active)} data-size={size} />
        </Tooltip>
      );
    }
  )
)`
  --indicator-size: 4rem;

  display: inline-block;
  width: var(--indicator-size);
  height: var(--indicator-size);
  border-radius: 100vmax;
  border: 0.25rem solid var(--color-blue-gray-10);
  background-color: var(--color-blue-gray-35);

  &[data-active] {
    background-color: var(--color-green-45);
  }

  &[data-size=${Size.XSMALL}] {
    --indicator-size: 2rem;
  }

  &[data-size=${Size.SMALL}] {
    --indicator-size: 3rem;
    border-width: 0.5rem;
  }
`;

export const RiskStatusIndicator = styled(({ status, ...props }: { status: RiskStatus }) => (
  <span {...props} data-status={status} />
))`
  --indicator-size: 2.5rem;

  width: var(--indicator-size);
  height: var(--indicator-size);
  display: inline-block;
  border-radius: 100vmax;
  border: 0.25rem solid var(--color-blue-gray-10);
  background-color: var(--color-blue-gray-35);

  &[data-status='Open'] {
    background-color: var(--color-red-50);
  }

  &[data-status='Accepted'] {
    background-color: var(--color-green-45);
  }
`;

export const EventStatusIndicator = styled(RiskStatusIndicator)`
  &[data-status='Failure'] {
    background-color: var(--color-red-50);
  }

  &[data-status='Success'] {
    background-color: var(--color-green-45);
  }
`;
