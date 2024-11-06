import { ReactNode } from 'react';
import styled from 'styled-components';
import { IconButton } from '@src-v2/components/buttons';
import { Divider as BaseDivider } from '@src-v2/components/divider';
import { useCollapsible } from '@src-v2/hooks/use-collapsible';
import { assignStyledNodes } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

export enum IconAlignment {
  Right = 'right',
  Left = 'left',
}

type CollapsibleProps = {
  title?: ReactNode;
  open?: boolean;
  actions?: ReactNode;
  overflow?: string;
  defaultOpen?: boolean;
  lazyLoad?: boolean;
  onToggle?: (isOpen: boolean, event: MouseEvent) => void;
  iconName?: string;
  alignIcon?: IconAlignment;
  children: ReactNode;
  triggerOpenState?: {
    isOpen: boolean;
  };
  footer?: ReactNode;
};

function PlainCollapsible({
  title,
  actions,
  open,
  overflow,
  defaultOpen,
  lazyLoad,
  children,
  onToggle,
  iconName = 'Chevron',
  alignIcon = IconAlignment.Right,
  triggerOpenState,
  footer,
  ...props
}: CollapsibleProps) {
  const { isOpen, shouldRender, getTriggerProps, getContentProps } = useCollapsible({
    immutable: typeof open === 'undefined',
    open: open ?? defaultOpen,
    overflow,
    onToggle,
  });

  return (
    <div {...props} data-open={dataAttr(isOpen)} data-empty={dataAttr(!children)}>
      <Collapsible.Head {...getTriggerProps()}>
        {alignIcon === IconAlignment.Left && <Collapsible.Chevron name="Chevron" />}
        <Collapsible.Title>{title}</Collapsible.Title>
        {alignIcon === IconAlignment.Right && <Collapsible.Chevron name="Chevron" />}
        {isOpen && actions}
      </Collapsible.Head>

      <Collapsible.Body {...getContentProps()}>
        {(!lazyLoad || shouldRender) && children}
        {footer && (
          <>
            <Divider />
            {footer}
          </>
        )}
      </Collapsible.Body>
    </div>
  );
}

const _Collapsible = styled(PlainCollapsible)``;

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const Title = styled.div`
  width: 100%;
  font-size: var(--font-size-l);
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const Chevron = styled(IconButton)`
  transition: all 400ms;
  transform: rotate(90deg);

  ${_Collapsible}[data-open] > ${Head} & {
    transform: rotate(-90deg);
  }
`;

export const Collapsible = assignStyledNodes(_Collapsible, {
  Head,
  Title,
  Body: styled.div``,
  Chevron,
});

const Divider = styled(BaseDivider)`
  margin: 4rem 0;
`;
