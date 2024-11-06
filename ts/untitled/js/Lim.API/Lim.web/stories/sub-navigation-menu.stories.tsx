import { Meta } from '@storybook/react';
import { useState } from 'react';
import styled from 'styled-components';
import { SubNavigationMenu as SubNavigationMenuComponent } from '../src/src-v2/components/sub-navigation-menu';
import { SvgIcon } from './icon.stories';

const OPTIONS_MOCK = [
  { key: 'title-1', label: 'title 1', rightIcon: <SvgIcon name="Info" /> },
  { key: 'title-2', label: 'title 2', leftIcon: <SvgIcon name="Info" /> },
  { key: 'title-3', label: 'title 3' },
  { key: 'title-4', label: 'title 4' },
];

export default {
  title: 'Components/SubNavigationMenu',
  component: SubNavigationMenuComponent,
  argTypes: {},
} as Meta;

const SubNavigationMenuTemplate = args => {
  const [selected, setSelected] = useState(OPTIONS_MOCK[0].key);
  return (
    <Container>
      <SubNavigationMenuComponent
        {...args}
        options={OPTIONS_MOCK}
        currentOption={selected}
        onChange={(key: string) => setSelected(key)}
      />
    </Container>
  );
};
export const SubNavigationMenu = SubNavigationMenuTemplate.bind({});
SubNavigationMenu.args = {
  title: 'Title',
  allOptionLabel: 'All options',
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 10rem;
  gap: 2rem;
`;
