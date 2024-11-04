import { observer } from 'mobx-react';
import { useCallback, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { FormContext } from '@src-v2/components/forms';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { Page } from '@src-v2/components/layout/page';
import { transformUserScopeSubmitData } from '@src-v2/components/user-scope';
import { ExtendedUserScopeType } from '@src-v2/containers/access-tokens/access-token-form';
import { RoleFormContent } from '@src-v2/containers/roles/role-form-content';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject } from '@src-v2/hooks';
import { useSuspense } from '@src-v2/hooks/react-helpers/use-suspense';
import { useBreadcrumbs } from '@src-v2/hooks/use-breadcrumbs';
import { RolePermissionType } from '@src-v2/services';
import { StubAny } from '@src-v2/types/stub-any';

type RoleFormValuesType = {
  name: string;
  description: string;
  userScope: ExtendedUserScopeType;
  apiiroGroups: { key: string; name: string }[];
  identifiers: { value: string; label: string }[];
  permissions: string[];
};

export const RolesForm = observer((props: StubAny[]) => {
  const history = useHistory();
  const { roles, toaster } = useInject();
  const { key } = useParams<{ key: string }>();

  const [supportedPermissions, rolesList] = useSuspense([
    roles.getSupportedPermissions,
    roles.getRoles,
  ]);

  const isEditMode = Boolean(key);

  const [currentRole] = useState(rolesList?.find(role => role.key === key));

  useBreadcrumbs({
    breadcrumbs: [{ label: 'Roles and permissions', to: '/settings/access-permissions/roles' }],
  });

  const handleSuccess = useCallback(
    async (data: RoleFormValuesType) => {
      try {
        const isGlobalPermission = data.permissions?.includes?.(resourceTypes.Global);
        const apiiroGroupKeys = data.apiiroGroups?.map(group => group.key);
        const userScope = transformUserScopeSubmitData(data);

        const customPermissions = supportedPermissions?.filter(permission =>
          isGlobalPermission
            ? permission.resourceName === resourceTypes.Global
            : data.permissions?.includes(permission.resourceName)
        );

        await roles.createRole({
          ...data,
          permissions: customPermissions,
          identifiers: data.identifiers?.map(item => item.value ?? item),
          apiiroGroupKeys,
          userScope,
        });
        toaster.success(`Role ${data.name} saved successfully`);
        history.push('/settings/access-permissions/roles');
      } catch (error) {
        if (error.response.status === 400) {
          toaster.error(error.response.data);
        } else {
          toaster.error("Couldn't create role");
        }
      }
    },
    [roles, supportedPermissions]
  );

  const defaultValues = useMemo<Partial<RoleFormValuesType>>(
    () =>
      currentRole
        ? {
            ...currentRole,
            permissions: currentRole.permissions?.map(
              (permission: RolePermissionType) => permission.resourceName
            ),
            identifiers: currentRole.identifiers?.map(identifier => ({
              value: identifier,
              label: identifier,
            })),
            userScope: {
              ...currentRole.extendedUserScope,
              isGlobal: currentRole.userScope.isGlobal,
            },
          }
        : {},
    [currentRole]
  );

  return (
    <Page title={`${isEditMode ? 'Edit' : 'Create'} role`}>
      <AsyncBoundary>
        <FormContext
          {...props}
          defaultValues={defaultValues}
          onSubmit={handleSuccess}
          form={FormLayoutV2}>
          <RoleFormContent currentRole={currentRole} />
        </FormContext>
      </AsyncBoundary>
    </Page>
  );
});
