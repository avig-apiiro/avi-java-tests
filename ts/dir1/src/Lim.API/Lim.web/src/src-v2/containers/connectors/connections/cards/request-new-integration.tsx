import { useCallback } from 'react';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { CorneredCard } from '@src-v2/components/cards/cornered-card';
import { SvgIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading4, SubHeading4 } from '@src-v2/components/typography';
import { HelpModal, TOPIC_OPTIONS } from '@src-v2/containers/modals/help-modal';
import { useModalState } from '@src-v2/hooks/use-modal-state';

export const RequestNewIntegration = () => {
  const [modalElement, setModal, closeModel] = useModalState();

  const onRequestClicked = useCallback(() => {
    setModal(<HelpModal option={TOPIC_OPTIONS[3]} onClose={closeModel} />);
  }, []);

  return (
    <>
      <RequestCardWrapper>
        <RequestHeaderWrapper>
          <ConnectIcon size={Size.XXLARGE} name="Connect" />
          <Heading4>Request new integration</Heading4>
        </RequestHeaderWrapper>
        <RequestCardContent>
          <SubHeading4>
            Can’t find the integration you are looking for? Submit your request here
          </SubHeading4>
          <RequestButton variant={Variant.PRIMARY} onClick={onRequestClicked} size={Size.MEDIUM}>
            Request
          </RequestButton>
        </RequestCardContent>
      </RequestCardWrapper>
      {modalElement}
    </>
  );
};

const RequestCardWrapper = styled(CorneredCard)`
  width: 100%;
`;

const RequestCardContent = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 4rem;
`;

const RequestButton = styled(Button)`
  display: flex;
  align-self: flex-end;
  width: fit-content;
`;

const ConnectIcon = styled(SvgIcon)`
  flex-shrink: 0;
`;

const RequestHeaderWrapper = styled.div`
  display: flex;
  gap: 3rem;
  align-items: center;
`;
