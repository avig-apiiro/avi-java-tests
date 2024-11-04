import { useCallback } from 'react';
import { Redirect, useHistory, useParams } from 'react-router-dom';
import { FormContext } from '@src-v2/components/forms';
import { Form } from '@src-v2/components/forms/form-layout';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { Section } from '@src-v2/components/layout';
import { transformUserScopeSubmitData } from '@src-v2/components/user-scope';
import { AccessTokenFormEditor } from '@src-v2/containers/access-tokens/access-token-form-editor';
import {
  AccessTokenFormEditorV2,
  NO_PERMISSION,
} from '@src-v2/containers/access-tokens/access-token-form-editor-v2';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useBreadcrumbs } from '@src-v2/hooks/use-breadcrumbs';
import { AccessToken } from '@src-v2/services';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { ProviderGroup } from '@src-v2/types/enums/provider-group';
import { entries } from '@src-v2/utils/ts-utils';

type AccessTokenFormProps = {
  title: string;
  dataFetcher: ({ key }: { key?: string }) => Promise<AccessToken>;
};

type ExtendedUserScopeItem = {
  key: string;
  value: string;
  name: string;
  label: string;
  providerGroup?: ProviderGroup;
};

export type ExtendedUserScopeType = {
  isGlobal: boolean;
  applicationGroups: ExtendedUserScopeItem[];
  assetCollections: ExtendedUserScopeItem[];
  orgTeams: ExtendedUserScopeItem[];
  providerRepositories: ExtendedUserScopeItem[];
  servers: ExtendedUserScopeItem[];
};

export function AccessTokenForm({ title, dataFetcher, ...props }: AccessTokenFormProps) {
  const { key } = useParams<{ key: string }>();
  const { accessTokens, application, rbac } = useInject();
  const defaultValues = useSuspense(dataFetcher, { key });
  const history = useHistory();

  const isAccessTokenFeatureFlag = application.isFeatureEnabled(FeatureFlag.AccessTokenForm);
  const defaultForm = isAccessTokenFeatureFlag ? FormLayoutV2 : Form;

  useBreadcrumbs({
    breadcrumbs: [{ label: 'Access tokens', to: '/settings/access-permissions/tokens' }],
  });

  const handleSuccess = useCallback(
    async data => {
      await accessTokens.upsertAccessToken(data);
      history.push('/settings/access-permissions/tokens');
    },
    [accessTokens]
  );

  const handleSuccessV2 = useCallback(
    async (data: {
      key: string;
      value: string;
      userScope: ExtendedUserScopeType;
      permissions: Record<string, { value: string }>;
    }) => {
      const customPermissions = entries(data.permissions)
        .map(
          ([key, permission]) =>
            permission.value !== NO_PERMISSION && {
              resourceName: key,
              accessType: permission.value,
            }
        )
        .filter(Boolean);

      const userScope = transformUserScopeSubmitData(data);

      await accessTokens.upsertAccessToken({
        ...data,
        permissions: customPermissions,
        userScope,
      });
      history.push('/settings/access-permissions/tokens');
    },
    [accessTokens]
  );

  if (!rbac.canEdit(resourceTypes.AccessTokens)) {
    return <Redirect to="/settings" />;
  }

  return (
    <FormContext
      defaultValues={defaultValues}
      onSubmit={isAccessTokenFeatureFlag ? handleSuccessV2 : handleSuccess}
      {...props}
      form={defaultForm}>
      {isAccessTokenFeatureFlag ? (
        <AccessTokenFormEditorV2 accessToken={defaultValues} />
      ) : (
        <Section>
          <AccessTokenFormEditor accessToken={defaultValues} />
        </Section>
      )}
    </FormContext>
  );
}
