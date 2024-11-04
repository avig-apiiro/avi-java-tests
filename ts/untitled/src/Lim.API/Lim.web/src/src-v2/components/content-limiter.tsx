import { Children, ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import { useToggle } from '@src-v2/hooks';

type ContentLimiterProps = {
  limit?: number;
  moreLabel?: string;
  lessLabel?: string;
  onClick?: (event) => void;
  children: ReactNode;
};

export function ContentLimiter({
  limit = 10,
  moreLabel = 'Show all',
  lessLabel = 'Show less',
  onClick,
  children,
  ...props
}: ContentLimiterProps) {
  const childrenArray = Children.toArray(children);
  const [limited, toggleLimit] = useToggle(true);
  const handleToggle = useCallback(
    event => {
      onClick?.(event);
      toggleLimit();
    },
    [onClick, toggleLimit]
  );
  return (
    <>
      {limited ? childrenArray.slice(0, limit) : children}
      {childrenArray.length > limit && (
        <ContentLimiter.ToggleButton {...props} onClick={handleToggle}>
          {limited ? moreLabel : lessLabel}
        </ContentLimiter.ToggleButton>
      )}
    </>
  );
}

ContentLimiter.ToggleButton = styled.div`
  margin-top: 2rem;
  text-decoration: underline;
  cursor: pointer;
`;
