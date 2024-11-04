import { MouseEvent, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { CircleButton } from '@src-v2/components/button-v2';
import { DragHandle } from '@src-v2/components/drag-handle';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { usePaneState } from '@src-v2/components/panes/pane-context-provider';
import { TablePagination } from '@src-v2/components/table/table-addons';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { DataTable } from '@src-v2/containers/data-table/data-table';
import { useDetectClickOutside, useLocalStorage } from '@src-v2/hooks';
import { useDetectEscapePress } from '@src-v2/hooks/dom-events/use-detect-escape-press';
import { useMouseDrag } from '@src-v2/hooks/dom-events/use-mouse-drag';
import { StyledProps } from '@src-v2/types/styled';
import { stopPropagation } from '@src-v2/utils/dom-utils';

export type PaneProps = StyledProps<{
  disableClickOutside?: boolean;
  namespace?: string;
  onClose?: () => void;
  onPop?: () => void;
}>;

export function checkFloatingElementType(element: HTMLElement): boolean {
  const floatingContainersList = document.querySelectorAll(`[data-floating-element]`);
  for (const floatingContainer of floatingContainersList) {
    if (floatingContainer.contains(element)) {
      return true;
    }
  }

  return false;
}

export function Pane({
  namespace = 'default',
  disableClickOutside,
  onClose,
  onPop,
  children,
  ...props
}: PaneProps) {
  const ref = useRef<HTMLDivElement>();
  const [paneWidth, setPaneWidth] = useLocalStorage(`pane.width.${namespace}`);
  const { closePane, popPane } = usePaneState();

  const { pathname } = useLocation();
  const originalPathnameRef = useRef(pathname);

  const handleClose = useCallback(() => {
    onClose?.();
    closePane();
  }, [onClose, closePane]);

  const handlePop = useCallback(() => {
    onPop?.();
    popPane();
  }, [onPop, popPane]);

  const handleClickOutside = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (
        event.target instanceof HTMLElement &&
        !checkFloatingElementType(event.target as HTMLElement)
      ) {
        handleClose();
      }
    },
    [handleClose]
  );

  useDetectEscapePress(handleClose);
  useDetectClickOutside(ref, handleClickOutside);

  useEffect(() => {
    if (pathname !== originalPathnameRef.current) {
      handleClose();
    }
  }, [pathname, handleClose]);

  return (
    <BasePaneElement
      {...props}
      ref={ref}
      style={{ width: paneWidth ? `${paneWidth}vw` : '150rem' }}
      onMouseDown={stopPropagation}>
      <ClosePaneControl onClose={handleClose} onPop={handlePop} />
      <Pane.Content>{children}</Pane.Content>
      <Pane.ResizeHandle setPaneWidth={setPaneWidth} />
    </BasePaneElement>
  );
}

const BasePaneElement = styled.div`
  position: fixed;
  right: 0;
  bottom: 0;
  top: 0;
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  min-width: 250rem;
  max-width: 80vw;
  border-radius: 1rem;
  background-color: var(--color-white);
  transform: translateX(100%);
  animation: 0.1s ease-in forwards slideInAnimation;

  ${DataTable.BoxContainer} {
    width: 100%;
  }

  ${TablePagination} {
    margin: 1rem 0 0;
    gap: 4rem;
  }

  @keyframes slideInAnimation {
    100% {
      transform: translateX(0%);
    }
  }
`;

Pane.Content = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  overflow: hidden;
`;

Pane.ResizeHandle = styled(({ setPaneWidth, ...props }) => {
  const onMouseDown = useMouseDrag(moveEvent =>
    setPaneWidth(Math.floor(100 * (1 - moveEvent.clientX / window.innerWidth)))
  );

  return (
    <div {...props}>
      <DragHandle vertical variant={Variant.SECONDARY} onMouseDown={onMouseDown} />
    </div>
  );
})`
  position: absolute;
  top: 0;
  bottom: 0;
  left: -1rem;
  z-index: 1;

  ${DragHandle} {
    height: 100%;
    width: 6rem;
  }
`;

const ClosePaneControl = ({
  onClose,
  onPop,
  ...props
}: StyledProps<{ onClose: () => void; onPop: () => void }>) => {
  const { hasPanes } = usePaneState();
  return (
    <ClosePaneControlContainer>
      <CircleButton {...props} size={Size.MEDIUM} variant={Variant.TERTIARY} onClick={onClose}>
        <SvgIcon name="CloseLarge" />
      </CircleButton>
      {hasPanes && (
        <CircleButton {...props} size={Size.MEDIUM} variant={Variant.TERTIARY} onClick={onPop}>
          <SvgIcon name="Arrow" />
        </CircleButton>
      )}
    </ClosePaneControlContainer>
  );
};

const ClosePaneControlContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin: 2rem auto 0 4rem;
  background-color: transparent;

  ${BaseIcon}[data-name="Arrow"] {
    transform: rotateY(180deg);
  }
`;
