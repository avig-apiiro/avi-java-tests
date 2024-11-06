import { Meta } from '@storybook/react';
import styled from 'styled-components';
import { Chip } from '@src-v2/components/chips';
import { Size } from '@src-v2/components/types/enums/size';

export default {
  title: 'Components/Chip',
  component: Chip,
  argTypes: {},
} as Meta;

const Template = args => (
  <Container>
    <Chip {...args} size={Size.MEDIUM} />
    <Chip {...args} size={Size.SMALL} onClick={() => null} />
    <Chip {...args} size={Size.MEDIUM} onRemove={() => null} onClick={() => null} />
    <Chip {...args} size={Size.SMALL} onRemove={() => null} />
    <Chip {...args} size={Size.MEDIUM} disabled />
    <Chip {...args} size={Size.SMALL} disabled />
  </Container>
);

export const Default = Template.bind({});
Default.args = {
  children: 'Info Chip',
  onClick: null,
  onRemove: null,
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;
