import { ChangeEvent, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { Dropdown } from '@src-v2/components/dropdown';
import { Combobox, Radio } from '@src-v2/components/forms';
import { SelectControl } from '@src-v2/components/forms/form-controls';
import { FormLayoutV2, InputClickableLabel } from '@src-v2/components/forms/form-layout-v2';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Heading3, Heading5, SubHeading4 } from '@src-v2/components/typography';
import { permissionTypes } from '@src-v2/containers/access-tokens/access-token-form-editor-v2';
import { PermissionCard } from '@src-v2/containers/access-tokens/permissions/permission-card';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useSuspense } from '@src-v2/hooks';
import { FormPermissionsTypes } from '@src-v2/services';

const OPTIONS_NAMES = { GLOBAL: 'global', SPECIFIC: 'specific' };

export const PermissionsSection = ({
  selectedOption = 'access-token',
  onChange,
  ...props
}: {
  selectedOption?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}) => {
  const { accessTokens, rbac } = useInject();
  const permissions = useSuspense(accessTokens.getFormSpecificOptions);

  const { watch } = useFormContext();
  const activePermissions = watch('permissions') ?? {};

  const hasGlobalPermissions = rbac.canEdit(resourceTypes.Global);
  const [optionSelected, setOptionSelected] = useState(
    (activePermissions?.Global || Object.keys(activePermissions).length === 0) &&
      hasGlobalPermissions
      ? OPTIONS_NAMES.GLOBAL
      : OPTIONS_NAMES.SPECIFIC
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOptionSelected(event.target.value);
    onChange?.(event);
  };

  return (
    <FormLayoutV2.Section {...props}>
      <Heading3>Permissions</Heading3>
      {selectedOption === 'access-token' && (
        <>
          <PermissionContainer>
            <RadioLabel>
              <Radio
                value={OPTIONS_NAMES.GLOBAL}
                onChange={handleChange}
                checked={optionSelected === OPTIONS_NAMES.GLOBAL}
                disabled={!hasGlobalPermissions}
              />
              <TitleInfoContainer>
                <Heading5>Global permissions</Heading5>
                <InfoTooltip
                  content={
                    <TooltipContent>
                      The selected option is also applied to any new{'\n'}permissions added to this
                      category
                    </TooltipContent>
                  }
                />
              </TitleInfoContainer>
            </RadioLabel>
            <PermissionContentContainer>
              <SubHeading4>
                Provide access to all features and functionalities in the application
              </SubHeading4>
              {optionSelected === OPTIONS_NAMES.GLOBAL && (
                <SelectControl
                  rules={{ pattern: /\S/ }}
                  name={`permissions.${resourceTypes.Global}`}
                  defaultValue={permissionTypes.slice(1)[0]}
                  items={permissionTypes.slice(1)}
                  dropdownItem={Dropdown.IconItem}
                  searchable={false}
                  clearable={false}
                />
              )}
            </PermissionContentContainer>
          </PermissionContainer>
          <PermissionContainer>
            <RadioLabel>
              <Radio
                value={OPTIONS_NAMES.SPECIFIC}
                checked={optionSelected === OPTIONS_NAMES.SPECIFIC}
                onChange={handleChange}
              />
              <Heading5>Specific permissions</Heading5>
            </RadioLabel>
            <PermissionContentContainer>
              <SubHeading4>Provide customized access to specific functionalities</SubHeading4>
            </PermissionContentContainer>
          </PermissionContainer>
          {optionSelected === OPTIONS_NAMES.SPECIFIC && (
            <PermissionCardsContainer>
              {permissions.map((permission: FormPermissionsTypes) => {
                const activePartial = Boolean(
                  permission.partialPermissions.find(partial => watch(`permissions.${partial.key}`))
                );
                return (
                  <PermissionCard
                    key={permission.key}
                    {...permission}
                    fieldName={permission.key}
                    hasActivePartial={activePartial}
                  />
                );
              })}
            </PermissionCardsContainer>
          )}
        </>
      )}
      {(selectedOption === 'network-broker' || selectedOption === 'webhook') && (
        <PermissionTypeContainer>
          <Heading5>Permission type</Heading5>
          <SelectControl
            rules={{ pattern: /\S/ }}
            name={`permissions.${
              selectedOption === 'webhook'
                ? resourceTypes.GitLabResources
                : resourceTypes.NetworkBrokerConfigurations
            }`}
            defaultValue={permissionTypes[1]}
            items={permissionTypes}
            dropdownItem={Dropdown.IconItem}
            clearable={false}
            disabled
          />
        </PermissionTypeContainer>
      )}
    </FormLayoutV2.Section>
  );
};

const PermissionContainer = styled.div`
  display: flex;
  flex-direction: column;

  ${Combobox} {
    width: 55rem;
  }
`;

const PermissionContentContainer = styled(PermissionContainer)`
  padding-left: 6.5rem;
  gap: 2rem;
`;

const PermissionCardsContainer = styled(PermissionContainer)`
  gap: 4rem;
`;

export const TitleInfoContainer = styled.div`
  display: flex;
  align-items: center;
  font-size: var(--font-size-s);
  gap: 1rem;
`;

export const RadioLabel = styled(InputClickableLabel)`
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 2rem;
  cursor: pointer;

  &[data-disabled] {
    color: var(--color-blue-gray-40);
    pointer-events: none;
  }
`;

export const TooltipContent = styled.span`
  white-space: break-spaces;
`;

const PermissionTypeContainer = styled(PermissionContainer)`
  gap: 1rem;
`;
