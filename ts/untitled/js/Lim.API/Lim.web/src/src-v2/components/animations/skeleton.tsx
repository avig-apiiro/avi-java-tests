import { useMemo, useRef } from 'react';
import styled from 'styled-components';
import { InlineButton } from '@src-v2/components/buttons';
import { InputV2 } from '@src-v2/components/forms';
import { StyledProps } from '@src-v2/types/styled';

const SkeletonOverlay = styled.span`
  position: relative;
  display: inline-block;
  width: fit-content;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    z-index: 10;
    inset: 0;
    background: linear-gradient(
        to right,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.045) 50%,
        rgba(0, 0, 0, 0) 100%
      )
      no-repeat 200% 0/250% 100%;
    animation: movingBackground 2.5s infinite ease-in-out;
  }

  ${InlineButton}, ${InputV2} {
    width: 35rem;
    background-color: var(--color-blue-gray-20);
  }

  @keyframes movingBackground {
    from {
      background-position: 200% 0;
    }
    to {
      background-position: -100% 0;
    }
  }
`;

interface TextSkeletonProps extends StyledProps {
  length: number;
}

const TextSkeletonElement = styled.div`
  font-size: inherit;
  user-select: none;
  border-radius: 1rem;
  color: transparent;
  background-color: var(--color-blue-gray-20);
`;

const TextSkeleton = ({ length, ...props }: TextSkeletonProps) => {
  const children = useMemo(() => new Array(length + 1).join('#'), [length]);

  return (
    <SkeletonOverlay {...props}>
      <TextSkeletonElement>{children}</TextSkeletonElement>
    </SkeletonOverlay>
  );
};

const SelectSkeleton = styled(({ children, ...props }: StyledProps) => (
  <SkeletonOverlay {...props}>
    <InlineButton disabled>{children}</InlineButton>
  </SkeletonOverlay>
))`
  display: flex;
  border-radius: 100vmax;

  ${InlineButton} {
    width: 100%;
    border: none;
    color: transparent;
  }
`;

const InputSkeleton = styled((props: StyledProps) => (
  <SkeletonOverlay {...props}>
    <InputV2 disabled />
  </SkeletonOverlay>
))`
  border-radius: 2rem;
`;

interface SvgSkeletonProps extends StyledProps {
  svgUrl: string;
  height?: number;
}

const SvgSkeleton = styled(({ svgUrl, height, ...props }: SvgSkeletonProps) => {
  const initialHeightRef = useRef(height);

  return (
    <SkeletonOverlay {...props} svgUrl={svgUrl} style={{ height: initialHeightRef.current }}>
      <img src={svgUrl} alt="skeleton-placeholder" />
    </SkeletonOverlay>
  );
})`
  &:before {
    mask-size: contain;
    mask-image: ${props => (props.svgUrl ? `url(${props.svgUrl})` : '')};
  }
`;

export const Skeleton = {
  Svg: SvgSkeleton,
  Text: TextSkeleton,
  Select: SelectSkeleton,
  Input: InputSkeleton,
};
