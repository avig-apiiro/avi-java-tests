import styled from 'styled-components';
import { TriangleDown, TriangleUp } from '@src-v2/components/triangle';
import { StyledProps } from '@src-v2/types/styled';
import { toPercent } from '@src-v2/utils/number-utils';

export const ChangeBadge = styled(({ percent, ...props }: StyledProps<{ percent: number }>) => (
  <span {...props}>
    {percent > 0 ? <TriangleUp /> : <TriangleDown />}
    {toPercent(Math.abs(percent))}
  </span>
))`
  display: inline-flex;
  padding: 0 2rem;
  color: ${props => (props.percent > 0 ? 'var(--color-white)' : 'var(--color-green-65)')};
  font-size: var(--font-size-m);
  font-weight: 700;
  line-height: 6rem;
  align-items: center;
  border-radius: 100vmax;
  background-color: ${props =>
    props.percent > 0 ? 'var(--color-failure)' : 'var(--color-success)'};
  gap: 1rem;

  ${TriangleDown} {
    color: var(--color-green-65);
  }
`;
