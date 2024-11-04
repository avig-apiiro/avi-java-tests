import { ComponentProps, ComponentType, forwardRef } from 'react';
import styled from 'styled-components';
import { ClampTextEnd } from '@src-v2/components/clamp-text-end';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { useForwardRef } from '@src-v2/hooks';
import { useTextClamp } from '@src-v2/hooks/use-clamp-text';

type ClampTextProperties = Omit<ComponentProps<'span'>, 'children'> & {
  as?: string | ComponentType<any>;
  ellipsis?: string;
  suffix?: string;
  separator?: string;
  lines?: number;
  tooltip?: string;
  withTooltip?: boolean;
  elementSizeBoundToContent?: boolean;
  children: string;
};

export const ClampText = ({ lines, children, ...props }: ClampTextProperties) => {
  if (!lines || lines <= 1) {
    return <ClampTextEnd {...props}>{children}</ClampTextEnd>;
  }

  return (
    <ClampTextOld {...props} lines={lines}>
      {children}
    </ClampTextOld>
  );
};

const ClampTextOld = forwardRef<HTMLSpanElement, ClampTextProperties>(
  (
    {
      ellipsis,
      suffix,
      separator,
      lines,
      tooltip,
      withTooltip = true,
      elementSizeBoundToContent = true,
      children,
      ...props
    },
    forwardRef
  ) => {
    const ref = useForwardRef(forwardRef);

    const [clampedText, isClamped] = useTextClamp(ref, children, {
      ellipsis,
      suffix,
      separator,
      lines,
      elementSizeBoundToContent,
    });

    return (
      <CustomTooltip
        disabled={(!isClamped || !withTooltip) && (!tooltip || tooltip === children)}
        interactive
        content={
          <>
            {tooltip || children}
            {suffix ? `${separator ?? ''}${suffix}` : ''}
          </>
        }>
        <Clamp ref={ref as any} lines={lines} {...props}>
          {clampedText}
        </Clamp>
      </CustomTooltip>
    );
  }
);

export function ClampPath({
  separator = '/',
  children,
  ...props
}: ComponentProps<typeof ClampText> & { separator?: string; children: string }) {
  const parts = children.split(separator);
  const lastPart = parts.pop();
  return (
    <ClampTextOld {...props} suffix={(parts.length > 0 ? separator : '') + lastPart}>
      {parts.join(separator)}
    </ClampTextOld>
  );
}

export const Clamp = styled.span<{ lines?: number }>`
  width: 100%;
  max-width: 100%;

  overflow: hidden;
  overflow-wrap: anywhere;
  white-space: ${props => (props.lines > 1 ? 'unset' : 'nowrap')};

  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${props => props.lines ?? 1};
`;

const CustomTooltip = styled(Tooltip)`
  width: max-content;
`;
