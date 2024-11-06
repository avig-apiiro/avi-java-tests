import { Meta } from '@storybook/react';
import { RadioTilesSelection as RadioTilesSelectionComponent } from '../src/src-v2/components/forms/radio-tiles-selection';
import { SvgIcon } from './icon.stories';

export default {
  title: 'Components/RadioTilesSelection',
  component: RadioTilesSelectionComponent,
  args: {},
} as Meta;

const Template = args => <RadioTilesSelectionComponent {...args} options={optionsMock} />;
export const RadioTilesSelection = Template.bind({});
RadioTilesSelection.args = { onChange: () => alert('onChange') };

const optionsMock = [
  { value: 'Access Token', label: 'Access Token', icon: <SvgIcon name="AccessToken" /> },
  { value: 'Webhook', label: 'Webhook', icon: <SvgIcon name="Webhook" /> },
  { value: 'Broker', label: 'Broker', icon: <SvgIcon name="Broker" /> },
];
