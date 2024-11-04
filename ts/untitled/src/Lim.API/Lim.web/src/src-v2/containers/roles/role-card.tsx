import { observer } from 'mobx-react';
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { Card } from '@src-v2/components/cards';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { Dropdown } from '@src-v2/components/dropdown';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { SvgIcon } from '@src-v2/components/icons';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Heading3, SubHeading4 } from '@src-v2/components/typography';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { RoleType } from '@src-v2/services';
import { StubAny } from '@src-v2/types/stub-any';
import { pluralFormat } from '@src-v2/utils/number-utils';

export const RoleCard = styled(
  observer(({ role, ...props }: { role: RoleType }) => {
    const history = useHistory();
    const { roles, rbac } = useInject();
    const [modalElement, setModal, closeModal] = useModalState();
    const canEditRoles = rbac.canEdit(resourceTypes.Roles);

    const handleEdit = useCallback(() => {
      setModal(
        <DeleteRoleModal
          data={role}
          onSubmit={() => roles.deleteRole({ key: role.key })}
          onClose={closeModal}
        />
      );
    }, [role, roles, closeModal]);

    return (
      <>
        <Card {...props}>
          <NameDescription>
            <Heading3>{role.name}</Heading3>
            {role.description && <SubHeading4>{role.description}</SubHeading4>}
          </NameDescription>
          <Tooltip
            content={role.apiiroGroups.map(group => (
              <div key={group.key}>{group.name}</div>
            ))}
            disabled={role.apiiroGroups.length === 0}>
            <AssignedGroups>
              {pluralFormat(role.apiiroGroups?.length, 'Assigned group', undefined, true)}
            </AssignedGroups>
          </Tooltip>
          <Tooltip content="Contact your admin to edit or delete a role" disabled={canEditRoles}>
            <DropdownMenu disabled={!canEditRoles}>
              <>
                <Dropdown.Item
                  onClick={() =>
                    history.push(`/settings/access-permissions/roles/${role.key}/edit`)
                  }>
                  <SvgIcon name="Edit" /> Edit
                </Dropdown.Item>
                <Dropdown.Item onClick={handleEdit}>
                  <SvgIcon name="Trash" /> Delete
                </Dropdown.Item>
              </>
            </DropdownMenu>
          </Tooltip>
        </Card>
        {modalElement}
      </>
    );
  })
)`
  height: 25rem;
  display: grid;
  grid-template-columns: 70% 20% 10%;
  align-items: center;
`;

const NameDescription = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const AssignedGroups = styled.div`
  width: fit-content;
`;

const DeleteRoleModal = ({
  data,
  onSubmit,
  onClose,
  ...props
}: {
  data: StubAny;
  onSubmit: StubAny;
  onClose: StubAny;
}) => (
  <ConfirmationModal
    {...props}
    title="Delete role"
    submitStatus="failure"
    submitText="Delete"
    onSubmit={useCallback(() => onSubmit(data), [data, onSubmit])}
    onClose={onClose}>
    Are you sure you want to delete this role?
  </ConfirmationModal>
);
