import { Meta } from '@storybook/react';
import { useState } from 'react';
import { MemoryRouter } from 'react-router';
import styled from 'styled-components';
import { Variant } from '../src/src-v2/components/types/enums/variant-enum';
import { Tabs as TabsComponent } from '../src/src-v2/components/tabs/tabs';

const TABS_MOCK = [
  { key: 'title-1', label: 'title 1' },
  { key: 'title-2', label: 'title 2' },
  { key: 'title-3', label: 'title 3' },
  { key: 'title-4', label: 'title 4' },
];

export default {
  title: 'Components/Tabs',
  component: TabsComponent,
  decorators: [
    Story => {
      return (
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      );
    },
  ],
  argTypes: {
    variant: {
      control: {
        type: 'select',
      },
      options: [Variant.SECONDARY, Variant.TERTIARY],
    },
  },
} as Meta;

const TabsTemplate = args => {
  const [selected, setSelected] = useState(TABS_MOCK[0].key);
  return (
    <Container>
      {/*example of tabs without state*/}
      <TabsComponent
        {...args}
        tabs={TABS_MOCK.map((tab, index) => ({ ...tab, to: String(index) }))}
      />
      <br />
      <TabsComponent {...args} tabs={TABS_MOCK} selected={selected} onChange={setSelected} />
      <br />
      <TabsComponent
        {...args}
        tabs={TABS_MOCK}
        variant={Variant.SECONDARY}
        selected={selected}
        onChange={setSelected}
      />
      <br />
      <TabsComponent
        {...args}
        tabs={TABS_MOCK}
        variant={Variant.TERTIARY}
        selected={selected}
        onChange={setSelected}
      />
    </Container>
  );
};
export const Tabs = TabsTemplate.bind({});
Tabs.args = {};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 10rem;
  gap: 2rem;
`;
