import { Meta } from '@storybook/react';
import styled from 'styled-components';
import emptyBox from '@src-v2/assets/images/empty-state/empty-box.svg';
import legoImage from '@src-v2/assets/images/empty-state/lego-create.svg';
import { Button } from '../src/src-v2/components/button-v2';
import {
  ConnectEmptyLayout as ConnectEmptyLayoutComponent,
  GeneralErrorLayout as GeneralErrorLayoutComponent,
} from '../src/src-v2/components/layout';
import { Variant } from '../src/src-v2/components/types/enums/variant-enum';

export default {
  title: 'Components/EmptyStateLayout',
  argTypes: {},
} as Meta;

const EmptyStateLayoutTemplate = args => (
  <Container>
    <ConnectEmptyLayoutComponent {...args} />
  </Container>
);

export const EmptyStateLayout = EmptyStateLayoutTemplate.bind({});

EmptyStateLayout.args = {
  title: 'Create your first workflow',
  description: (
    <>
      <span>Leverage the power of Apiiro automation for proactive action.</span>
      <span>
        Build workflows to trigger notifications, assign issues, make pull request comments, create
        tickets, produce Pentesting reports, and more.
      </span>
      <span>For more information, see the Apiiro User Docs</span>
    </>
  ),
  image: legoImage,
  children: (
    <Button variant={Variant.PRIMARY} onClick={() => alert('CTA')}>
      Create workflow
    </Button>
  ),
};

const GeneralErrorLayoutTemplate = args => (
  <GeneralErrorLayoutComponent {...args} image={emptyBox} />
);
export const GeneralErrorLayout = GeneralErrorLayoutTemplate.bind({});
GeneralErrorLayout.args = {
  title: 'No tokens created yet',
  description: (
    <span>
      For more information, see the Apiiro Users Doc.{'\n'}or the Apiiro API documentation
    </span>
  ),
  image: legoImage,
  children: (
    <Button variant={Variant.PRIMARY} onClick={() => alert('CTA')}>
      Create token
    </Button>
  ),
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10rem;
`;
