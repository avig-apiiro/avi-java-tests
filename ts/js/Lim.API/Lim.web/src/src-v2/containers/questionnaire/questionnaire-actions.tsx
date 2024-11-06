import { Dropdown } from '@src-v2/components/dropdown';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { useDiscardQuestionnaireModal } from '@src-v2/containers/questionnaire/hooks/use-discard-questionnaire-modal';
import { useShareLinkModal } from '@src-v2/containers/questionnaire/hooks/use-share-link-modal';
import { Status } from '@src-v2/types/queastionnaire/questionnaire-response';
import { QuestionnaireSummary } from '@src-v2/types/queastionnaire/questionnaire-summary';
import { stopPropagation } from '@src-v2/utils/dom-utils';

export const QuestionnaireActionsMenu = ({
  summary: { id, accessKey, currentState },
}: {
  summary: QuestionnaireSummary;
}) => {
  const { showShareModal, shareLinkModalElement } = useShareLinkModal({});

  const [modalElement, onDiscardClick] = useDiscardQuestionnaireModal(id);
  return (
    currentState.status !== Status.Discarded && (
      <>
        <DropdownMenu onClick={stopPropagation} onItemClick={stopPropagation}>
          <Dropdown.Item
            onClick={() =>
              showShareModal(
                `/questionnaire-public/${id}?accessKey=${encodeURIComponent(accessKey)}`
              )
            }>
            <Tooltip content="Send the link to recipients to ask them to respond to the questionnaire.">
              <p>Copy link</p>
            </Tooltip>
          </Dropdown.Item>
          <Dropdown.Item onClick={onDiscardClick}>Discard</Dropdown.Item>
        </DropdownMenu>
        {modalElement}
        {shareLinkModalElement}
      </>
    )
  );
};
