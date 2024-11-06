import _ from 'lodash';
import styled from 'styled-components';
import { SubHeading2 } from '@src-v2/components/typography';
import { StyledProps } from '@src-v2/types/styled';
import { abbreviate } from '@src-v2/utils/number-utils';

type VerticalCounterProps = {
  title: string;
  value: number;
};

export const VerticalCounter = styled(({ title, value }: StyledProps<VerticalCounterProps>) => (
  <SubHeading2>
    {_.isFinite(value) ? abbreviate(value) : value ?? 0} {title}
  </SubHeading2>
))``;
