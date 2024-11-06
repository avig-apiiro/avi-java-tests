import _ from 'lodash';
import { ReactNode, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { Combobox } from '@src-v2/components/forms';
import {
  CheckboxGroupControl,
  GroupControlContainer,
  InputControl,
  SelectControl,
  SelectControlV2,
} from '@src-v2/components/forms/form-controls';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import {
  Heading1,
  Heading3,
  Heading5,
  Paragraph,
  Strong,
  SubHeading3,
  SubHeading4,
} from '@src-v2/components/typography';
import { UserScope } from '@src-v2/components/user-scope';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject } from '@src-v2/hooks';
import { useSuspense } from '@src-v2/hooks/react-helpers/use-suspense';
import { RolePermissionType } from '@src-v2/services';
import { StubAny } from '@src-v2/types/stub-any';

export const RoleFormContent = styled(props => {
  const { roles, userGroups, session, rbac } = useInject();
  const { key } = useParams<{ key: string }>();
  const { watch } = useFormContext();
  const supportedPermissions = useSuspense(roles.getSupportedPermissions);
  const [permissions] = watch(['permissions']);

  const isEditMode = Boolean(key);

  const [globalPermission, otherPermissions] = useMemo(
    () =>
      _.partition(
        supportedPermissions,
        (permission: RolePermissionType) => permission.resourceName === resourceTypes.Global
      ),
    [supportedPermissions]
  );

  return (
    <>
      <FormLayoutV2.Container {...props}>
        <FormLayoutV2.Section>
          <Heading1>{isEditMode ? `Edit ` : 'Create'} role</Heading1>
          <FormLayoutV2.Label required>
            <Heading5>Name</Heading5>
            <InputControl
              name="name"
              placeholder="Type role name... e.g. Admin"
              rules={{ required: true }}
              autoFocus
            />
          </FormLayoutV2.Label>
          <FormLayoutV2.Label>
            <Heading5>Description</Heading5>
            <InputControl
              name="description"
              placeholder="Provide a brief description of the role..."
            />
          </FormLayoutV2.Label>
        </FormLayoutV2.Section>
        <FormLayoutV2.Section>
          <SectionHeader>
            <Heading3>Assign role</Heading3>
            <SubHeading4>
              <Strong>Tip: </Strong>Paste a list of group names separated by a space ( ), comma (,),
              semicolon (;) or a new line
            </SubHeading4>
          </SectionHeader>
          <FormLayoutV2.Label>
            <Heading5>
              Assign role to IDP groups
              <InfoTooltip
                content={authenticationTypesSteps[
                  session.authType as keyof typeof authenticationTypesSteps
                ]?.map((tooltip: ReactNode, index: number) => (
                  <Paragraph key={index}>{tooltip}</Paragraph>
                ))}
              />
            </Heading5>

            <SelectControl name="identifiers" placeholder="Type to group name" multiple creatable />
          </FormLayoutV2.Label>

          <FormLayoutV2.Label>
            <Heading5>
              Assign role to Apiiro groups
              <InfoTooltip content="Assign a role to a user group defined in Apiiro" />
            </Heading5>

            <SelectControlV2
              multiple
              name="apiiroGroups"
              placeholder="Type to select..."
              formatOptionLabel={(data: StubAny) => <>{data.name}</>}
              rules={{ pattern: /\S/ }}
              searchMethod={userGroups.getApiiroUserGroups}
            />
          </FormLayoutV2.Label>
        </FormLayoutV2.Section>
        <FormLayoutV2.Section>
          <SectionHeader>
            <Heading3>Permissions</Heading3>
            <SubHeading3>Select the actions that users with this role can perform</SubHeading3>
          </SectionHeader>
          <GlobalPermission>
            <CheckboxGroupControl
              name="permissions"
              options={[
                {
                  value: globalPermission[0].resourceName,
                  label: globalPermission[0].resourceDisplayName,
                  description: globalPermission[0].description,
                  disabled: !rbac.hasPermission(globalPermission[0]),
                },
              ]}
            />
          </GlobalPermission>
          <CheckboxGroupControl
            disabled={permissions?.includes?.(resourceTypes.Global)}
            name="permissions"
            options={otherPermissions.map((permission: RolePermissionType) => ({
              value: permission.resourceName,
              label: permission.resourceDisplayName,
              description: permission.description,
              disabled: !rbac.hasPermission(permission),
              optionDisabledText:
                'You cannot add permissions or scopes beyond those assigned to your role. Contact your administrator if you need additional access.',
            }))}
          />
        </FormLayoutV2.Section>
        <UserScope />
      </FormLayoutV2.Container>
      <FormLayoutV2.Footer>
        <FormLayoutV2.Actions>
          <Button
            to="/settings/access-permissions/roles"
            variant={Variant.SECONDARY}
            size={Size.LARGE}>
            Cancel
          </Button>
          <Button type="submit" size={Size.LARGE}>
            Save
          </Button>
        </FormLayoutV2.Actions>
      </FormLayoutV2.Footer>
    </>
  );
})`
  ${Combobox} {
    width: 100%;
    max-width: 100%;
  }

  ${FormLayoutV2.Section} > ${GroupControlContainer} {
    display: grid;
    grid-template-columns: 50% 50%;
    gap: 4rem;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const GlobalPermission = styled.div`
  padding: 0 0 1rem 0;
  border-bottom: 0.25rem solid var(--color-blue-gray-20);

  ${GroupControlContainer} {
    height: 11rem;
    margin-bottom: 2rem;
  }
`;

export const authenticationTypesSteps = {
  AzureActiveDirectory: [
    'Assign roles by AAD group ID or application role',
    'For groups, go to AAD > Groups > Object ID',
    'For application roles, go to AAD > Enterprise Applications > Apiiro application > Roles and administrators',
  ],
  Okta: ['Assign roles by an Okta group names', 'Go to Okta > Apiiro Application > Groups'],
  Saml2: ['Assign roles by group names'],
  SelfServiceRbacGateway: ['Assign roles by group names in your IDP'],
};
