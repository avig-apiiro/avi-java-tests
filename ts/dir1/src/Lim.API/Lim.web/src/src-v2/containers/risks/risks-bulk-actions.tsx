import { useCallback } from 'react';
import { RiskStatusIndicator } from '@src-v2/components/activity-indicator';
import { Dropdown } from '@src-v2/components/dropdown';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { SelectMenu } from '@src-v2/components/select-menu';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { OverrideBulkRiskLevelModal } from '@src-v2/containers/action-modals/override-risk/override-risk-level';
import { OverrideRiskStatusModal } from '@src-v2/containers/action-modals/override-risk/override-risk-status';
import { MessagingActionItems } from '@src-v2/containers/risks/actions/messaging-action-items';
import { TicketingActionItems } from '@src-v2/containers/risks/actions/ticketing-action-items';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { DataTable } from '@src-v2/models/data-table';
import { RiskLevel, RiskStatus } from '@src-v2/types/enums/risk-level';
import { StubAny } from '@src-v2/types/stub-any';

export function TakeBulkActions({ dataModel, ...props }: { dataModel: StubAny }) {
  const [modalElement, setModal, closeModal] = useModalState();

  return (
    <>
      <SelectMenu maxHeight="150rem" placeholder="Take Action" {...props} variant={Variant.PRIMARY}>
        <Dropdown.Group title="Send a Message">
          <MessagingActionItems data={dataModel} setModal={setModal} closeModal={closeModal} />
        </Dropdown.Group>
        <Dropdown.Group title="Create a Ticket">
          <TicketingActionItems data={dataModel} setModal={setModal} closeModal={closeModal} />
        </Dropdown.Group>
      </SelectMenu>

      {modalElement}
    </>
  );
}

export function RiskStatusBulkChange<T extends { key: string }, TMetadata extends any = never>({
  dataModel,
  ...props
}: {
  dataModel: DataTable<T, TMetadata>;
}) {
  const { rbac } = useInject();
  const [modalElement, setModal, closeModal] = useModalState();
  const canEdit = rbac.canEdit(resourceTypes.RiskStatus);

  const handleClick = useCallback(
    (newRiskStatus: RiskStatus) => {
      setModal(
        <OverrideRiskStatusModal
          risk={dataModel.selection}
          disabledSubmitButton={!canEdit}
          newRiskStatus={newRiskStatus}
          onClose={closeModal}
          onSubmit={() => dataModel.clearSelection()}
        />
      );
    },
    [dataModel.selection, dataModel.clearSelection, canEdit, closeModal]
  );

  return (
    <>
      <SelectMenu placeholder="Change risk status" {...props}>
        <Dropdown.Item onClick={() => handleClick(RiskStatus.Open)}>
          <RiskStatusIndicator status={RiskStatus.Open} /> Open
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleClick(RiskStatus.Accepted)}>
          <RiskStatusIndicator status={RiskStatus.Accepted} /> Accepted
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleClick(RiskStatus.Ignored)}>
          <RiskStatusIndicator status={RiskStatus.Ignored} /> Ignored
        </Dropdown.Item>
      </SelectMenu>

      {modalElement}
    </>
  );
}

export function RiskLevelBulkChange<T extends { key: string }, TMetadata extends any = never>({
  dataModel,
  ...props
}: {
  dataModel: DataTable<T, TMetadata>;
}) {
  const { rbac } = useInject();
  const [modalElement, setModal, closeModal] = useModalState();
  const canEdit = rbac.canEdit(resourceTypes.RiskLevel);

  const handleClick = useCallback(
    (newRiskLevel: RiskLevel) => {
      setModal(
        <OverrideBulkRiskLevelModal
          risk={dataModel.selection}
          disabledSubmitButton={!canEdit}
          newRiskLevel={newRiskLevel}
          onClose={closeModal}
          onSubmit={() => dataModel.clearSelection()}
        />
      );
    },
    [dataModel.selection, dataModel.clearSelection, canEdit, closeModal]
  );

  return (
    <>
      <SelectMenu placeholder="Change risk levels" {...props}>
        <Dropdown.Item onClick={() => handleClick(RiskLevel.Critical)}>
          <RiskIcon riskLevel={RiskLevel.Critical} /> {RiskLevel.Critical}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleClick(RiskLevel.High)}>
          <RiskIcon riskLevel={RiskLevel.High} /> {RiskLevel.High}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleClick(RiskLevel.Medium)}>
          <RiskIcon riskLevel={RiskLevel.Medium} /> {RiskLevel.Medium}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleClick(RiskLevel.Low)}>
          <RiskIcon riskLevel={RiskLevel.Low} /> {RiskLevel.Low}
        </Dropdown.Item>
      </SelectMenu>

      {modalElement}
    </>
  );
}
