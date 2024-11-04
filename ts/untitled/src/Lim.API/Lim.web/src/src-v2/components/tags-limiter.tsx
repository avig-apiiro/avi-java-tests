import { Children, ReactNode } from 'react';
import styled from 'styled-components';
import { Tippy } from '@src-v2/components/tooltips/tippy';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';

type TagsLimiterProps = {
  limit?: number;
  excessLimit?: number;
  children: ReactNode;
};

export function TagsLimiter({ limit = 3, excessLimit = 10, children, ...props }: TagsLimiterProps) {
  const childrenArray = Children.toArray(children);

  return (
    <TagsList {...props}>
      {childrenArray.slice(0, limit)}
      {childrenArray.length > limit && (
        <Tooltip
          content={
            <TagsList>
              {childrenArray.slice(limit, excessLimit + limit)}
              {childrenArray.length - limit > excessLimit && (
                <ExcessText>and {childrenArray.length - limit - excessLimit} more...</ExcessText>
              )}
            </TagsList>
          }>
          <ExcessText>+{childrenArray.length - limit} more</ExcessText>
        </Tooltip>
      )}
    </TagsList>
  );
}

const TagsList = styled.div`
  display: flex;
  color: var(--color-blue-gray-60);
  gap: 2rem;

  ${Tippy.Container} & {
    color: var(--color-white);
  }
`;

const ExcessText = styled.span`
  font-size: var(--font-size-s);
  align-self: flex-end;
`;
