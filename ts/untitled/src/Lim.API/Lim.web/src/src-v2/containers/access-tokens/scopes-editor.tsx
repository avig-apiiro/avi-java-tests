import _ from 'lodash';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { CollapsibleCard } from '@src-v2/components/cards';
import { Collapsible } from '@src-v2/components/collapsible';
import { Checkbox } from '@src-v2/components/forms';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { UserPermission } from '@src-v2/types/user-permission';
import { permissionEquals } from '@src/blocks/RolesPage/roleUtils';

const containsPermission = (allPermissions: UserPermission[], permissionToCheck: UserPermission) =>
  _.some(allPermissions, permission => permissionEquals(permission, permissionToCheck));

export function ScopesEditor() {
  const { setValue, watch } = useFormContext();
  const tokenTypeToRoleResource: Record<string, string> = {
    Global: resourceTypes.Global,
    Webhook: resourceTypes.GitLabResources,
    'Network Broker': resourceTypes.NetworkBrokerConfigurations,
  };
  const checkedPermissions = watch('permissions');

  const togglePermission = useCallback(
    (selectedPermission: UserPermission) =>
      setValue(
        'permissions',
        containsPermission(checkedPermissions, selectedPermission)
          ? _.reject(checkedPermissions, (permission: UserPermission) =>
              permissionEquals(permission, selectedPermission)
            )
          : [...checkedPermissions, selectedPermission]
      ),
    [checkedPermissions]
  );

  return (
    <>
      {Object.keys(tokenTypeToRoleResource).map(tokenType => {
        const resourceName = tokenTypeToRoleResource[tokenType];
        const isFullPermissionChecked = containsPermission(checkedPermissions, {
          resourceName,
          accessType: 'Write',
        });
        const isReadPermissionChecked = containsPermission(checkedPermissions, {
          resourceName,
          accessType: 'Read',
        });

        return (
          <TokenTypeItem key={tokenType} title={tokenType}>
            <Label>
              <Checkbox
                checked={isFullPermissionChecked}
                onChange={() => togglePermission({ resourceName, accessType: 'Write' })}
              />
              Full Control (Read & Write)
            </Label>
            <Label>
              <Checkbox
                disabled={isFullPermissionChecked}
                checked={isFullPermissionChecked || isReadPermissionChecked}
                onChange={() => togglePermission({ resourceName, accessType: 'Read' })}
              />
              Read
            </Label>
          </TokenTypeItem>
        );
      })}
    </>
  );
}

const TokenTypeItem = styled(CollapsibleCard)`
  &:not(:last-child) {
    margin-bottom: 6rem;
  }

  ${Collapsible.Title} {
    font-weight: 400;
  }
`;

const Label = styled.label`
  display: flex;
  width: fit-content;
  align-items: center;
  line-height: 8rem;
  cursor: pointer;
  gap: 3rem;

  &:last-child {
    margin-bottom: 4rem;
  }
`;
