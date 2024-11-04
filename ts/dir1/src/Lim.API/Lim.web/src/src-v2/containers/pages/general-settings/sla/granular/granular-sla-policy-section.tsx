import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { Dropdown } from '@src-v2/components/dropdown';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { SvgIcon } from '@src-v2/components/icons';
import { Table } from '@src-v2/components/table/table';
import { TableHeader } from '@src-v2/components/table/table-header';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading4 } from '@src-v2/components/typography';
import { createGranularPoliciesColumns } from '@src-v2/containers/pages/general-settings/sla/granular/granular-definitions-table-columns';
import { GranularSlaPolicyModal } from '@src-v2/containers/pages/general-settings/sla/granular/granular-sla-policy-modal';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { useTable } from '@src-v2/hooks/use-table';
import { GranulatedSlaPolicyDefinition } from '@src-v2/services';

export const granularPoliciesFieldName = 'granularPolicies';

export type FormGranulatedSlaPolicyDefinition = GranulatedSlaPolicyDefinition & {
  isDirty?: boolean;
};

export const GranularSlaPolicySection = () => {
  const { setValue, watch } = useFormContext();
  const policies: FormGranulatedSlaPolicyDefinition[] = watch(granularPoliciesFieldName) ?? [];
  const [modalElement, setModal, closeModal] = useModalState();

  const handleOpenSLAModal = useCallback(
    (policy: Partial<GranulatedSlaPolicyDefinition>) => {
      setModal(
        <GranularSlaPolicyModal
          defaultPolicy={policy}
          existingPolicies={policies}
          onSubmit={handleSubmitModal}
          onClose={closeModal}
        />
      );

      function handleSubmitModal(newPolicy: FormGranulatedSlaPolicyDefinition) {
        newPolicy.isDirty = true;

        const newPolicies = policies;
        if (newPolicy.key) {
          const existingPolicyIndex = _.findIndex(policies, { key: newPolicy.key });
          newPolicies.splice(existingPolicyIndex, 1, newPolicy);
        } else {
          newPolicies.push({
            ...newPolicy,
            key: crypto.randomUUID(),
          });
        }

        setValue(granularPoliciesFieldName, newPolicies, { shouldDirty: true });
        closeModal();
      }
    },
    [setModal, closeModal, policies]
  );

  const handleDeleteModal = useCallback(
    (policyToRemove: GranulatedSlaPolicyDefinition) => {
      setModal(
        <ConfirmationModal
          submitStatus="failure"
          title="Delete SLA policy"
          submitText="Delete"
          onSubmit={handleDelete}
          onClose={closeModal}>
          Deleting this SLA policy may affect your risk management protocols and compliance.
          <br />
          Are you sure?
        </ConfirmationModal>
      );

      function handleDelete() {
        setValue(
          granularPoliciesFieldName,
          policies.filter(policy => policy.key !== policyToRemove.key),
          { shouldDirty: true }
        );
        closeModal();
      }
    },
    [setModal, closeModal, policies]
  );

  const granularPoliciesColumns = useMemo(
    () =>
      createGranularPoliciesColumns({
        onEdit: policy => handleOpenSLAModal(policy),
        onDelete: handleDeleteModal,
      }),
    [handleDeleteModal, handleOpenSLAModal]
  );

  const tableModel = useTable({ tableColumns: granularPoliciesColumns, hasReorderColumns: false });

  return (
    <>
      <Heading4>Specific SLA policies</Heading4>
      {Boolean(policies?.length) && (
        <TableContainer>
          <Table>
            <TableHeader tableModel={tableModel} />
            <Table.Body>
              {policies.map(policy => (
                <Table.Row key={policy.key}>
                  {tableModel.columns.map(({ key, Cell }) => (
                    <Cell key={key} data={policy} />
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </TableContainer>
      )}

      <DropdownMenu
        noArrow
        icon="Plus"
        label="Add specific SLA"
        variant={Variant.PRIMARY}
        size={Size.SMALL}>
        <Dropdown.Item onClick={() => handleOpenSLAModal({ policyType: 'Application' })}>
          By applications
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleOpenSLAModal({ policyType: 'OrgTeam' })}>
          By teams
        </Dropdown.Item>
      </DropdownMenu>

      <FormLayoutV2.SectionFooter>
        <SvgIcon name="Info" size={Size.XXSMALL} />
        Defining specific SLA will override the general SLA for the specific selected assets,
        applying after profile calculation
      </FormLayoutV2.SectionFooter>
      {modalElement}
    </>
  );
};

const TableContainer = styled.div`
  flex: 1;
  overflow-x: auto;
`;
