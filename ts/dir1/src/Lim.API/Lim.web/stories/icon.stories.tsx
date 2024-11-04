import { Meta } from '@storybook/react';
import styled from 'styled-components';
import * as languageIcons from '@src-v2/assets/languages';
import * as vendorIcons from '@src-v2/assets/vendors';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import * as svgIcons from '../src/src-v2/assets/icons';
import {
  LanguageIcon as LanguageIconCmp,
  SvgIcon as SvgIconCmp,
  VendorIcon as VendorIconCmp,
} from '../src/src-v2/components/icons';

export default {
  title: 'Components/Icons',
  component: SvgIconCmp,
  argTypes: {
    size: {
      control: {
        type: 'select',
        labels: [Size.SMALL, Size.MEDIUM, Size.LARGE, Size.XLARGE, Size.XXLARGE, Size.XXXLARGE],
      },
    },
  },
} as Meta;

const SvgIconTemplate = args => (
  <Container>
    {Object.keys(svgIcons).map(key => (
      <Tooltip content={key}>
        <SvgIconCmp {...args} key={key} name={key} />
      </Tooltip>
    ))}
    <SingleIconContainer>
      Single usage:
      <SvgIconCmp {...args} />
    </SingleIconContainer>
  </Container>
);

export const SvgIcon = SvgIconTemplate.bind({});

SvgIcon.args = {
  name: 'Plus',
  size: Size.SMALL,
};

const VendorIconTemplate = args => (
  <Container>
    {Object.keys(vendorIcons).map(key => (
      <Tooltip content={key}>
        <VendorIconCmp {...args} key={key} name={key} />
      </Tooltip>
    ))}
    <SingleIconContainer>
      Single usage:
      <VendorIconCmp {...args} />
    </SingleIconContainer>
  </Container>
);

export const VendorIcon = VendorIconTemplate.bind({});

VendorIcon.args = {
  name: 'BlackDuck',
  size: Size.SMALL,
};

const LanguageIconTemplate = args => (
  <Container>
    {Object.keys(languageIcons).map(key => (
      <Tooltip content={key}>
        <LanguageIconCmp {...args} key={key} name={key} />
      </Tooltip>
    ))}
    <SingleIconContainer>
      Single usage:
      <LanguageIconCmp {...args} />
    </SingleIconContainer>
  </Container>
);

export const LanguageIcon = LanguageIconTemplate.bind({});

LanguageIcon.args = {
  name: 'Java',
  size: Size.SMALL,
};

const Container = styled.div`
  width: 200rem;
  display: flex;
  align-self: center;
  flex-wrap: wrap;
  margin: 10rem;
  gap: 2rem;
`;

const SingleIconContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 10rem;
`;
