import { Meta } from '@storybook/react';
import styled from 'styled-components';
import {
  Caption1,
  Caption2,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Paragraph,
  SubHeading1,
  SubHeading2,
  SubHeading3,
} from '../src/src-v2/components/typography';

export default {
  title: 'Components/Typography',
  argTypes: {},
} as Meta;

const TypographyTemplate = () => (
  <Container>
    <Heading1>Heading 1</Heading1>
    <Heading2>Heading 2</Heading2>
    <Heading3>Heading 3</Heading3>
    <Heading4>Heading 4</Heading4>
    <Heading5>Heading 5</Heading5>
    <Heading6>Heading 6</Heading6>
    <br />
    <SubHeading1>Sub Heading 1</SubHeading1>
    <SubHeading2>Sub Heading 2</SubHeading2>
    <SubHeading3>Sub Heading 3</SubHeading3>
    <br />
    <Paragraph>Paragraph</Paragraph>
    <br />
    <Caption1>Caption 1</Caption1>
    <Caption2>Caption 2</Caption2>
  </Container>
);
export const Typography = TypographyTemplate.bind({});

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 8rem;
  gap: 2rem;
`;
