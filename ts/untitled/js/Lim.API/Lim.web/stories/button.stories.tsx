import { Meta } from '@storybook/react';
import {
  ArrowButton as ArrowButtonCmp,
  ChevronPagingButton as ChevronPagingButtonCmp,
  CircleButton as CircleButtonCmp,
  DeleteButton as DeleteButtonCmp,
  DynamicButton as DynamicButtonCmp,
  IconButton as IconButtonCmp,
  InlineButton as InlineButtonCmp,
  InsertAction as InsertActionCmp,
  TextIconButton as TextIconButtonCmp,
  UnderlineButton as UnderlineButtonCmp,
} from '@src-v2/components/buttons';
import { FileReaderButton as FileReaderButtonCmp } from '@src-v2/components/file-reader-button';
import { Size } from '../src/src-v2/components/types/enums/size';
import { SvgIcon } from './icon.stories';

export default {
  title: 'Components/Button',
  parameters: {
    docs: {
      description: {
        component:
          '***Please do not use these components, they are depricate. Please use the Buttons component detailed in a separate story ***',
      },
    },
  },
  argTypes: {
    onClick: () => alert('onClick'),
  },
} as Meta;

const DynamicButtonTemplate = args => <DynamicButtonCmp {...args} />;
export const Dynamic = DynamicButtonTemplate.bind({});
Dynamic.args = {
  disabled: false,
  onClick: () => alert('onClick'),
  children: 'Click me',
};

const InlineButtonTemplate = args => <InlineButtonCmp {...args} />;
export const Inline = InlineButtonTemplate.bind({});
Inline.args = {
  disabled: false,
  onClick: () => alert('onClick'),
  children: 'Click me',
};

export const InlineFailure = InlineButtonTemplate.bind({});
InlineFailure.args = {
  disabled: false,
  onClick: () => alert('onClick'),
  children: 'Click me',
  'data-status': 'failure',
};

const InsertActionTemplate = args => <InsertActionCmp {...args} />;
export const InsertAction = InsertActionTemplate.bind({});
InsertAction.args = {
  disabled: false,
  onClick: () => alert('onClick'),
  children: 'Click me',
};

const ArrowButtonTemplate = args => <ArrowButtonCmp {...args} />;
export const Arrow = ArrowButtonTemplate.bind({});
Arrow.args = {
  disabled: false,
  onClick: () => alert('onClick'),
  children: 'Click me',
};

const IconButtonTemplate = args => <IconButtonCmp {...args} />;
export const Icon = IconButtonTemplate.bind({});
Icon.args = {
  disabled: false,
  onClick: () => alert('onClick'),
  children: 'Click me',
};

const UnderlineButtonTemplate = args => <UnderlineButtonCmp {...args} />;
export const Underline = UnderlineButtonTemplate.bind({});
Underline.args = {
  disabled: false,
  onClick: () => alert('onClick'),
  children: 'Click me',
};

const TextIconButtonTemplate = args => <TextIconButtonCmp {...args} />;
export const TextIcon = TextIconButtonTemplate.bind({});
TextIcon.args = {
  iconName: 'Plus',
  status: 'primary',
  onClick: () => alert('onClick'),
  children: 'Click me',
};

export const Loading = TextIconButtonTemplate.bind({});
Loading.args = {
  iconName: 'Plus',
  status: 'primary',
  loading: true,
  onClick: () => alert('onClick'),
  children: 'Click me',
};

const FileReaderButtonTemplate = args => <FileReaderButtonCmp {...args} />;
export const UploadFile = FileReaderButtonTemplate.bind({});
UploadFile.args = {};

const ChevronPagingButtonTemplate = args => <ChevronPagingButtonCmp {...args} />;
export const PagingPrev = ChevronPagingButtonTemplate.bind({});
PagingPrev.args = {
  onClick: () => alert('onClick'),
  children: 'Prev',
  'data-prev': true,
};

export const PagingNext = ChevronPagingButtonTemplate.bind({});
PagingNext.args = {
  onClick: () => alert('onClick'),
  children: 'Next',
  'data-next': true,
};

const CircleButtonTemplate = args => <CircleButtonCmp {...args} />;
export const CircleButton = CircleButtonTemplate.bind({});
CircleButton.args = {
  children: <SvgIcon name="Plus" size={Size.LARGE} />,
  onClick: () => alert('onClick'),
};

const DeleteButtonTemplate = args => <DeleteButtonCmp {...args} />;
export const DeleteButton = DeleteButtonTemplate.bind({});
DeleteButton.args = {
  children: <SvgIcon name="Plus" size={Size.LARGE} />,
  onClick: () => alert('onClick'),
};
