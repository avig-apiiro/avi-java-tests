import { forwardRef, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { Dropdown } from '@src-v2/components/dropdown';
import { Menu } from '@src-v2/components/entity-pane/risk-pane/risk-pane-actions';
import { DiscardModal } from '@src-v2/components/forms/form-actions';
import { SvgIcon } from '@src-v2/components/icons';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { ActionModal } from '@src-v2/containers/modals/action-modal';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { ManualFindingResponse } from '@src-v2/services';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { StyledProps } from '@src-v2/types/styled';
import { stopPropagation } from '@src-v2/utils/dom-utils';
import { DropdownMenu } from '@src/src-v2/components/dropdown-menu';
import { Table } from '@src/src-v2/components/table/table';
import { Size } from '@src/src-v2/components/types/enums/size';

export const FindingPaneActions = forwardRef<HTMLElement, StyledProps>((props, ref) => {
  const [modalElement, setModal, closeModal] = useModalState();

  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.EntryPoint]: 'Pane action dropdown' }}>
      <Menu
        appendTo="parent"
        placeholder="Actions"
        variant={Variant.PRIMARY}
        rows={15}
        onClick={stopPropagation}
        onItemClick={stopPropagation}
        {...props}
        ref={ref}>
        <Dropdown.Group title="Take action">
          <Dropdown.Item onClick={() => {}}>
            <SvgIcon name="Edit" />
            Edit finding
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() =>
              setModal(
                <ActionModal
                  onSubmit={() => {}}
                  submitText="Delete"
                  title="Delete this finding?"
                  onClose={closeModal}
                />
              )
            }>
            <SvgIcon name="OpenTrash" />
            Delete finding
          </Dropdown.Item>
        </Dropdown.Group>
      </Menu>

      {modalElement}
    </AnalyticsLayer>
  );
});

export const FindingRowActionCell = forwardRef<
  HTMLImageElement,
  {
    disabled: boolean;
    data: ManualFindingResponse;
  }
>(({ data, disabled, ...props }, ref) => {
  const [modalElement, setModal, closeModal] = useModalState();
  const history = useHistory();
  const { findings, toaster, rbac, application } = useInject();

  const canWrite = rbac.canEdit(resourceTypes.ManualFindings);

  const deleteFinding = useCallback(async () => {
    try {
      await findings.deleteFinding(data.key);
      closeModal();
      toaster.success('Finding deleted');
    } catch {
      toaster.error('Failed to delete finding');
    }
  }, [data.key]);

  const startEdit = useCallback(() => {
    const path = application.isFeatureEnabled(FeatureFlag.SettingsNewLayout)
      ? `/manual-findings/${data.rawFindingKey}/edit`
      : `/settings/manual-findings/${data.rawFindingKey}/edit`;
    history.push(path);
  }, [data.rawFindingKey]);

  return (
    <Table.FlexCell {...props} data-action-menu data-pinned-column>
      <AnalyticsLayer
        analyticsData={{
          [AnalyticsDataField.EntryPoint]: 'finding row action dropdown',
        }}>
        <DropdownMenu
          {...props}
          ref={ref}
          disabled={disabled}
          onClick={stopPropagation}
          onItemClick={stopPropagation}
          size={Size.XLARGE}>
          <Dropdown.Group title="Take action">
            <Dropdown.Item onClick={startEdit} disabled={!canWrite}>
              <SvgIcon name="Edit" />
              Edit finding
            </Dropdown.Item>
            <Dropdown.Item
              disabled={!canWrite}
              onClick={() =>
                setModal(
                  <DiscardModal
                    title="Delete finding?"
                    submitText="Delete"
                    onSubmit={deleteFinding}
                    onClose={closeModal}>
                    This action will permanently delete {data.name}.
                    <br />
                    Are you sure?
                  </DiscardModal>
                )
              }>
              <SvgIcon name="OpenTrash" />
              Delete finding
            </Dropdown.Item>
          </Dropdown.Group>
        </DropdownMenu>
        {modalElement}
      </AnalyticsLayer>
    </Table.FlexCell>
  );
});
