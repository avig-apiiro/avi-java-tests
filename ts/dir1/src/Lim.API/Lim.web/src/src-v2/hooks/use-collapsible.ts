import { MutableRefObject, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { StubAny } from '@src-v2/types/stub-any';

type UseCollapsibleProps = Partial<{
  open: boolean;
  disabled: boolean;
  duration: number | [number, number];
  easing: string;
  overflow: string;
  immutable: StubAny;
  onOpen: (event: StubAny) => void;
  onOpening: () => void;
  onClose: (event: StubAny) => void;
  onClosing: () => void;
  onToggle: (isOpen: boolean, event: MouseEvent) => void;
}>;

export function useCollapsible<TContent extends HTMLElement = HTMLDivElement>({
  open,
  disabled,
  duration = 400,
  easing = 'var(--ease-in-out-quad)',
  overflow = 'hidden',
  immutable,
  onOpen,
  onOpening,
  onClose,
  onClosing,
  onToggle,
}: UseCollapsibleProps = {}) {
  const [isOpen, setOpen] = useState(Boolean(open));
  const wasOpen = useRef(Boolean(open));
  const contentRef = useRef<TContent>();
  const triggerRef = useRef();

  if (typeof duration === 'number') {
    duration = [duration, duration];
  }

  useLayoutEffect(() => {
    if (!contentRef.current) {
      return;
    }

    const { dataset, style } = contentRef.current;
    if (dataset.ready) {
      return toggleCollapsible(Boolean(open));
    }
    dataset.ready = 'true';
    if (open) {
      style.overflow = overflow;
      style.height = 'auto';
    } else {
      style.overflow = 'hidden';
      style.height = '0';
    }
  }, [immutable || open]);

  const handleTriggerClick = useCallback(
    (event: StubAny) => {
      toggleCollapsible(!isOpen);
      onToggle?.(!isOpen, event);
    },
    [disabled, duration, easing, isOpen, onOpening, onClosing, onToggle]
  );

  const handleTransitionEnd = useCallback(
    (event: StubAny) => {
      if (event.target !== contentRef.current) {
        return;
      }
      const { dataset, style } = contentRef.current;
      delete dataset.inTransition;
      if (isOpen) {
        style.overflow = overflow;
        style.height = 'auto';
        onOpen?.(event);
      } else {
        onClose?.(event);
      }
    },
    [isOpen, onOpen, onClose]
  );

  return {
    isOpen,
    shouldRender: isOpen || wasOpen.current,
    getTriggerProps(props = {}) {
      return {
        ...props,
        ref: triggerRef,
        onClick: handleTriggerClick,
      };
    },
    getContentProps(props = {}) {
      return {
        ...props,
        ref: contentRef,
        onTransitionEnd: handleTransitionEnd,
      };
    },
  };

  function toggleCollapsible(shouldOpen: StubAny) {
    const { dataset } = contentRef.current;
    if (shouldOpen === isOpen || disabled || dataset.inTransition) {
      return;
    }
    if (shouldOpen) {
      openCollapsible(contentRef, duration, easing);
      wasOpen.current = true;
      setOpen(true);
      onOpening?.();
    } else {
      closeCollapsible(contentRef, duration, easing);
      setOpen(false);
      onClosing?.();
    }
  }
}

function openCollapsible<T extends HTMLElement>(
  contentRef: MutableRefObject<T>,
  duration: number | [number, number],
  easing: string
) {
  window.requestAnimationFrame(() => {
    if (contentRef.current?.scrollHeight) {
      const durationValue = Array.isArray(duration) ? duration[0] : duration;
      setTransition(contentRef, durationValue, easing);
    }
  });
}

function closeCollapsible<T extends HTMLElement>(
  contentRef: MutableRefObject<T>,
  duration: number | [number, number],
  easing: string
) {
  if (contentRef.current?.scrollHeight) {
    const { style } = contentRef.current;
    const durationValue = Array.isArray(duration) ? duration[1] : duration;
    setTransition(contentRef, durationValue, easing);
    window.requestAnimationFrame(() => {
      style.overflow = 'hidden';
      style.height = String(0);
    });
  }
}

function setTransition<T extends HTMLElement>(
  contentRef: MutableRefObject<T>,
  duration: number | [number, number],
  easing: string
) {
  const { dataset, scrollHeight, style } = contentRef.current;
  style.transition = `height ${duration}ms ${easing}`;
  style.height = `${scrollHeight}px`;
  dataset.inTransition = '';
}
