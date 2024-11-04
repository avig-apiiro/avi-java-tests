import { forwardRef } from 'react';
import styled from 'styled-components';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { Dropdown } from '@src-v2/components/dropdown';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { SelectMenu } from '@src-v2/components/select-menu';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { CommentActionItem } from '@src-v2/containers/risks/actions/comment-action-item';
import { MessagingActionItems } from '@src-v2/containers/risks/actions/messaging-action-items';
import { TicketingActionItems } from '@src-v2/containers/risks/actions/ticketing-action-items';
import {
  ExploreActionSection,
  OverrideRiskRowAction,
} from '@src-v2/containers/risks/risk-row-actions';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { StyledProps } from '@src-v2/types/styled';
import { stopPropagation } from '@src-v2/utils/dom-utils';

export const RiskPaneActions = forwardRef<HTMLElement, StyledProps>((props, ref) => {
  const { risk: data } = useEntityPaneContext();
  const [modalElement, setModal, closeModal] = useModalState();

  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.EntryPoint]: 'Pane action dropdown' }}>
      <Menu
        maxHeight="100%"
        appendTo="parent"
        placeholder="Actions"
        variant={Variant.PRIMARY}
        rows={15}
        onClick={stopPropagation}
        onItemClick={stopPropagation}
        {...props}
        ref={ref}>
        <Dropdown.Group title="Take action">
          <MessagingActionItems data={data} setModal={setModal} closeModal={closeModal} />
          <TicketingActionItems data={data} setModal={setModal} closeModal={closeModal} />
          <CommentActionItem data={data} setModal={setModal} closeModal={closeModal} />
        </Dropdown.Group>
        <OverrideRiskRowAction risk={data} setModal={setModal} closeModal={closeModal} />
        {data.relatedEntity?.vendor !== 'Perforce' &&
          data.riskCategory !== 'Branch Protection' &&
          data.riskCategory !== 'Permissions' && <ExploreActionSection riskData={data} />}
      </Menu>

      {modalElement}
    </AnalyticsLayer>
  );
});

export const Menu = styled(SelectMenu)`
  ${SelectMenu.Popover} {
    max-width: 55rem;
  }
`;
