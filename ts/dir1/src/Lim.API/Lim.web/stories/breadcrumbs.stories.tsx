import { Meta } from '@storybook/react';
import { Breadcrumbs as BreadcrumbsCmp } from '../src/src-v2/components/breadcrumbs';

export default {
  title: 'Components/Breadcrumbs',
  component: BreadcrumbsCmp,
  argTypes: {
    icon: {
      type: { name: 'string' },
    },
  },
} as Meta;

const BreadcrumbsTemplate = args => (
  <BreadcrumbsCmp {...args}>
    {['First', 'Second', 'Third', 'Fourth', 'Fifth'].map(item => (
      <a key={item} href={item}>
        {item}
      </a>
    ))}
  </BreadcrumbsCmp>
);
export const Breadcrumbs = BreadcrumbsTemplate.bind({});
Breadcrumbs.args = {
  title: 'Banner Title',
  description: 'Description: Title can be passed as a component',
  onClose: () => alert('onClose'),
  icon: 'Check',
};
