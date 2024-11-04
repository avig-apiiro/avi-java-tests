import styled from 'styled-components';
import { Card } from '@src-v2/components/cards';
import { Heading, Paragraph } from '@src-v2/components/typography';

export const VerticalIndicatorRow = styled(Card)<{ color: string }>`
  position: relative;
  display: flex;
  height: 14.25rem;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 3rem;
  padding-left: 11rem;
  padding-right: 2rem;
  line-height: 1.1;
  border: none;
  box-shadow: var(--elevation-0);

  &:before {
    content: '';
    position: absolute;
    width: 2rem;
    height: 10.5rem;
    left: 3rem;
    border-radius: 1rem;
    background-color: ${props => props.color};
    margin: 2rem 0;
  }

  ${Heading} {
    font-size: var(--font-size-xxl);
    margin-bottom: 0;
  }

  ${Paragraph} {
    font-size: var(--font-size-s);
    margin-bottom: 0;
  }
`;
