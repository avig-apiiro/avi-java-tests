import styled from 'styled-components';
import { IconButton } from '@src-v2/components/buttons';
import { SvgIcon } from '@src-v2/components/icons';
import { TippyAttributes } from '@src-v2/components/tooltips/tippy';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { useGroupProperties } from '@src-v2/hooks';
import { stopPropagation } from '@src-v2/utils/dom-utils';

export const IconTooltip = styled(props => {
  const [tooltipProps, buttonProps] = useGroupProperties(props, TippyAttributes);
  const IconComponent = props.onClick || props['data-clickable'] ? IconButton : SvgIcon;
  return (
    <Tooltip {...tooltipProps}>
      <IconComponent {...buttonProps} />
    </Tooltip>
  );
})`
  min-width: 5rem;
  pointer-events: all !important; //sometimes info tooltip can be inside pointer-events non blocks, and it's good practise to override this hence the important
`;

export const InfoTooltip = styled(props => {
  const [tooltipProps, buttonProps] = useGroupProperties(props, TippyAttributes);
  return (
    <Tooltip {...tooltipProps}>
      <SvgIcon size={Size.XXSMALL} {...buttonProps} name="Info" onClick={stopPropagation} />
    </Tooltip>
  );
})`
  color: var(--color-blue-gray-50);
  pointer-events: all !important; //sometimes info tooltip can be inside pointer-events non blocks, and it's good practise to override this hence the important

  &:hover {
    color: var(--color-blue-gray-60);
  }
`;

export const ErrorTooltip = styled(props => {
  const [tooltipProps, buttonProps] = useGroupProperties(props, TippyAttributes);
  return (
    <Tooltip {...tooltipProps}>
      <SvgIcon size={Size.XSMALL} {...buttonProps} name="Warning" />
    </Tooltip>
  );
})`
  color: var(--color-red-50);
  pointer-events: all !important;
  margin: 0;
`;
