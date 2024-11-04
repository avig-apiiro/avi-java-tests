import styled from 'styled-components';
import { Heading3 } from '@src-v2/components/typography';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

export const Divider = styled(({ vertical, ...props }: StyledProps<{ vertical?: boolean }>) => {
  return <hr {...props} data-vertical={dataAttr(vertical)} />;
})`
  background-color: var(--color-blue-gray-20);
  width: 100%;
  height: 0.25rem;

  &[data-vertical] {
    height: 100%;
    width: 0.25rem;
  }
`;

export const HeadingWithDivider = styled(({ children, ...props }: StyledProps) => (
  <div {...props}>
    <Heading3>{children}</Heading3>
    <Divider />
  </div>
))`
  display: flex;
  width: 100%;
  max-width: 240rem;
  gap: 4rem;
  align-items: center;
  padding: 0 3rem;

  ${Heading3} {
    min-width: fit-content;
  }
`;
