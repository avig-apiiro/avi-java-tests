import { Meta } from '@storybook/react';
import { useCallback } from 'react';
import styled from 'styled-components';
import { Button } from '../src/src-v2/components/button-v2';
import { ConfirmationModal as ConfirmationModalCmp } from '../src/src-v2/components/confirmation-modal';
import { useModalState } from '../src/src-v2/hooks/use-modal-state';

const StyledTemplate = styled.div`
  #modal {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    background-color: var(--overlay-dark-color);
    transition: opacity 400ms;
    z-index: 10;

    &:empty {
      visibility: hidden;
      opacity: 0;
    }
  }
`;
export default {
  title: 'Components/Confirmation Modal',
  component: ConfirmationModalCmp,
  argTypes: {},
} as Meta;

const Template = args => {
  const [modalElement, setModal, closeModal] = useModalState();
  const openModal = useCallback(() => {
    setModal(<ConfirmationModalCmp {...args} onClose={closeModal} />);
  }, [setModal, closeModal]);

  return (
    <StyledTemplate>
      {/*Do not copy  <Modal id="modal" /> used only for storybook iframe*/}
      <div id="modal" />
      <Button onClick={openModal}>Open Confirmation Modal</Button>
      {modalElement}
    </StyledTemplate>
  );
};

export const ConfirmationModal = Template.bind({});
ConfirmationModal.args = {
  title: 'This is the title',
  submitText: 'Submit Text',
  cancelText: 'Cancel Text',
  onSubmit: () => alert('onSubmit'),
  onError: () => alert('onError'),
};
