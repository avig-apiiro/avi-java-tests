import { Meta } from '@storybook/react';
import {
  Card as CardCmp,
  CollapsibleCard as CollapsibleCardCmp,
  DoubleCollapsibleCard as DoubleCollapsibleCardCmp,
} from '../src/src-v2/components/cards';

export default {
  title: 'Components/Card',
  argTypes: {
    to: { type: { name: 'string' } },
    href: { type: { name: 'string' } },
  },
} as Meta;

const CardTemplate = args => <CardCmp {...args} />;
export const Card = CardTemplate.bind({});
Card.args = {
  href: 'https://reactrouter.com/en/main',
  children: 'This card support "to", "href" and "onClick" props',
};

const CollapsibleCardTemplate = args => (
  <CollapsibleCardCmp {...args}>This is the content of the collapsible card</CollapsibleCardCmp>
);

export const CollapsibleCard = CollapsibleCardTemplate.bind({});
CollapsibleCard.args = {
  title: 'This is the collapsible card title',
  content: 'Collapsible card content',
};

const DoubleCollapsibleCardTemplate = args => (
  <DoubleCollapsibleCardCmp {...args}>
    This is the content of the collapsible card
  </DoubleCollapsibleCardCmp>
);

export const DoubleCollapsibleCard = DoubleCollapsibleCardTemplate.bind({});
DoubleCollapsibleCard.args = {
  title: 'This is the collapsible card title',
  content: 'This double collapsible card content',
  nestedContent: 'This is double collaspbie card nested content',
};
