import { Meta } from '@storybook/react';
import { Collapsible as CollapsibleCmp } from '../src/src-v2/components/collapsible';
import { Heading4 } from '../src/src-v2/components/typography';

export default {
  title: 'Components/Collapsible',
  component: CollapsibleCmp,
  argTypes: {},
} as Meta;

const CollapsibleTemplate = args => (
  <CollapsibleCmp {...args}>
    <Heading4>You discovered the content</Heading4>
  </CollapsibleCmp>
);

export const Collapsible = CollapsibleTemplate.bind({});
Collapsible.args = {
  title: <Heading4>This is title</Heading4>,
};
