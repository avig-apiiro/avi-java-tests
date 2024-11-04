import { ReactNode, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { EllipsisText } from '@src-v2/components/typography';

export const ClampTextEnd = ({ children, ...props }: { children: ReactNode; lines?: number }) => {
  const textRef = useRef(null);
  const [isOverflowed, setIsOverflowed] = useState(false);

  const updateOverflow = () => {
    if (textRef.current) {
      setIsOverflowed(textRef.current.scrollWidth > textRef.current.clientWidth);
    }
  };

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      updateOverflow();
    });

    if (textRef.current) {
      resizeObserver.observe(textRef.current);
    }

    return () => {
      if (textRef.current) {
        resizeObserver.unobserve(textRef.current);
      }
    };
  }, [children, textRef.current]);

  useLayoutEffect(() => {
    updateOverflow();
  }, [children, textRef.current]);

  const stringChild = useMemo(() => findStringChildren(children), [children]);

  return (
    <Tooltip content={stringChild} disabled={!isOverflowed}>
      <EllipsisText ref={textRef} {...props}>
        {children}
      </EllipsisText>
    </Tooltip>
  );
};

const findStringChildren = (children: any) => {
  if (!children || typeof children === 'string' || !children?.props) {
    return children;
  }
  return findStringChildren(children?.props?.children);
};
