import { ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import { SvgIcon } from '@src-v2/components/icons';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Paragraph } from '@src-v2/components/typography';
import { HelpModal } from '@src-v2/containers/modals/help-modal';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr, preventDefault } from '@src-v2/utils/dom-utils';

type FaultedIconProps = {
  content: string | ReactNode;
  disabled?: boolean;
  isWarning?: boolean;
  size?: Size;
};

type TokenExpirationDateAlertProps = {
  dateDifference: number;
  canEdit?: boolean;
  disabled?: boolean;
  handleEdit?: () => void;
};

type TokenAlertContentProps = {
  dateDifference: number;
  canEdit?: boolean;
  disabled?: boolean;
  handleEdit?: () => void;
  handleOpenHelpModal: () => void;
};

export const FaultedIcon = styled(
  ({ content, disabled, isWarning = false, ...props }: StyledProps<FaultedIconProps>) => (
    <Tooltip content={content} disabled={disabled} interactive>
      <SvgIcon {...props} onClick={preventDefault} name="Warning" />
    </Tooltip>
  )
)`
  color: ${props => (!props.isWarning ? 'var(--color-red-45)' : 'var(--color-orange-55)')};
`;
export const TokenExpirationDateAlert = styled(
  ({
    dateDifference,
    canEdit,
    disabled,
    handleEdit,
    ...props
  }: StyledProps<TokenExpirationDateAlertProps>) => {
    const [modalElement, setModal, closeModal] = useModalState();

    const handleOpenHelpModal = useCallback(
      () => setModal(<HelpModal onClose={closeModal} />),
      [closeModal]
    );

    return (
      <>
        <FaultedIcon
          {...props}
          data-expired={dataAttr(dateDifference <= 0)}
          size={Size.XSMALL}
          content={
            <TokenAlertContent
              dateDifference={dateDifference}
              canEdit={canEdit}
              disabled={disabled}
              handleEdit={handleEdit}
              handleOpenHelpModal={handleOpenHelpModal}
            />
          }
        />
        {modalElement}
      </>
    );
  }
)`
  color: var(--color-blue-gray-40);

  &[data-expired] {
    color: var(--color-red-45);
  }
`;

const TokenAlertContent = styled(
  ({
    dateDifference,
    canEdit,
    disabled,
    handleEdit,
    handleOpenHelpModal,
    ...props
  }: StyledProps<TokenAlertContentProps>) => (
    <div {...props}>
      <Paragraph>
        {dateDifference <= 0
          ? 'Token expired! Update your token'
          : `Token is about to expire in ${dateDifference} days!`}
      </Paragraph>
    </div>
  )
)`
  ${Paragraph} {
    margin: 0;
  }
`;
