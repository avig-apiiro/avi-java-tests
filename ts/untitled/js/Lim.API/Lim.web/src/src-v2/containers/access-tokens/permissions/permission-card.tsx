import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { Card } from '@src-v2/components/cards';
import { Dropdown } from '@src-v2/components/dropdown';
import { CheckboxToggle, Combobox, Radio } from '@src-v2/components/forms';
import { SelectControl } from '@src-v2/components/forms/form-controls';
import { InputClickableLabel } from '@src-v2/components/forms/form-layout-v2';
import { IconTooltip, InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Heading5, SubHeading4 } from '@src-v2/components/typography';
import { permissionTypes } from '@src-v2/containers/access-tokens/access-token-form-editor-v2';
import {
  RadioLabel,
  TitleInfoContainer,
  TooltipContent,
} from '@src-v2/containers/access-tokens/permissions/permissions-section';
import { useToggle } from '@src-v2/hooks';
import { FormPartialPermissionsTypes } from '@src-v2/services';
import { dataAttr } from '@src-v2/utils/dom-utils';

const PERMISSIONS_OPTIONS = { ALL: 'all', PARTIAL: 'partial' };

export const PermissionCard = styled(
  ({
    fieldName,
    title,
    description,
    partialPermissions,
    hasActivePartial = false,
    disabled = false,
    ...props
  }: {
    fieldName: string;
    title: string;
    description: string;
    partialPermissions: FormPartialPermissionsTypes[];
    disabled?: boolean;
    hasActivePartial?: boolean;
  }) => {
    const { watch, setValue, unregister } = useFormContext();

    const somePartialsDisabled = partialPermissions.some(
      partialPermission => partialPermission.disabled
    );
    const [selected, setSelected] = useState(
      hasActivePartial || somePartialsDisabled
        ? PERMISSIONS_OPTIONS.PARTIAL
        : PERMISSIONS_OPTIONS.ALL
    );

    const [isPermissionOpen, toggleCollapsible] = useToggle(
      Boolean(watch(`permissions.${fieldName}`)) || hasActivePartial
    );

    useEffect(() => {
      return () => unregister(`permissions.${fieldName}`);
    }, [fieldName, unregister]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      setSelected(event.target.value);
    };

    const handlePermissionToggle = useCallback(() => {
      if (isPermissionOpen) {
        unregister(`permissions.${fieldName}`);
      } else if (!somePartialsDisabled) {
        setValue(`permissions.${fieldName}`, permissionTypes[1]);
      }
      toggleCollapsible();
    }, [isPermissionOpen, fieldName, setValue, unregister]);

    return (
      <Card {...props} data-disabled={dataAttr(disabled)}>
        <PermissionHeader>
          <CheckboxToggle
            checked={isPermissionOpen}
            onChange={handlePermissionToggle}
            disabled={disabled}
          />
          <ContainerColumn>
            <Heading5>{title}</Heading5>
            <SubHeading4>{description}</SubHeading4>
            {disabled && (
              <DisabledTooltip
                name="Help"
                content="This functionality is not included in your user permissions"
              />
            )}
          </ContainerColumn>
        </PermissionHeader>
        {isPermissionOpen && (
          <ContentContainer>
            <BodyTopLine />
            <ContainerColumnBigGap>
              <AllPermissionsContainerColumn>
                <RadioLabel>
                  <Radio
                    value={PERMISSIONS_OPTIONS.ALL}
                    checked={selected === PERMISSIONS_OPTIONS.ALL}
                    onChange={handleChange}
                    disabled={somePartialsDisabled}
                  />
                  <TitleInfoContainer>
                    All permissions
                    <InfoTooltip
                      content={
                        <TooltipContent>
                          Selection this option will be applied automatically on{'\n'}new
                          permissions in this category that will be added
                        </TooltipContent>
                      }
                    />
                  </TitleInfoContainer>
                </RadioLabel>
                {selected === PERMISSIONS_OPTIONS.ALL && (
                  <SelectControl
                    rules={{ pattern: /\S/ }}
                    name={`permissions.${fieldName}`}
                    defaultValue={permissionTypes.slice(1)[0]}
                    items={permissionTypes.slice(1)}
                    dropdownItem={Dropdown.IconItem}
                    searchable={false}
                    clearable={false}
                  />
                )}
              </AllPermissionsContainerColumn>
              <ContainerColumnBigGap>
                <RadioLabel data-disabled={dataAttr(partialPermissions?.length === 0)}>
                  <Radio
                    value={PERMISSIONS_OPTIONS.PARTIAL}
                    checked={selected === PERMISSIONS_OPTIONS.PARTIAL}
                    disabled={Boolean(partialPermissions?.length === 0)}
                    onChange={handleChange}
                  />
                  Custom permissions
                </RadioLabel>
              </ContainerColumnBigGap>
            </ContainerColumnBigGap>
            <ContentContainer>
              {selected === PERMISSIONS_OPTIONS.PARTIAL && (
                <ContainerColumn>
                  {partialPermissions.map(partial => (
                    <PartialOption
                      key={partial.key}
                      {...partial}
                      fieldName={partial.key}
                      disabled={partial.disabled}
                    />
                  ))}
                </ContainerColumn>
              )}
            </ContentContainer>
          </ContentContainer>
        )}
      </Card>
    );
  }
)`
  padding: 3rem 0;

  &[data-disabled] {
    opacity: 0.5;
    pointer-events: none;
  }
`;

const PartialOption = styled(
  ({
    fieldName,
    title,
    description,
    partialPermissions,
    disabled,
    ...props
  }: {
    fieldName: string;
    title: string;
    description: string;
    disabled: boolean;
    partialPermissions?: FormPartialPermissionsTypes[];
  }) => {
    return (
      <div {...props}>
        <ContainerColumn>
          <Heading5>{title}</Heading5>
          <SubHeading4>{description}</SubHeading4>
        </ContainerColumn>
        <SelectControl
          rules={{ pattern: /\S/ }}
          name={`permissions.${fieldName}`}
          defaultValue={permissionTypes[0]}
          items={permissionTypes}
          dropdownItem={Dropdown.IconItem}
          searchable={false}
          clearable={false}
          disabled={disabled}
        />
      </div>
    );
  }
)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 0;
  border-top: 0.25rem solid var(--color-blue-gray-25);

  &:first-child {
    margin-top: 3rem;
  }

  &:last-child {
    padding-bottom: 0;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 6rem;
`;

const PermissionHeader = styled(InputClickableLabel)`
  display: flex;
  padding: 0 4rem;
  gap: 2rem;

  ${CheckboxToggle} {
    margin-top: 1rem;
  }
`;

const ContainerColumn = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  font-size: var(--font-size-s);
`;

const ContainerColumnBigGap = styled(ContainerColumn)`
  gap: 4rem;
`;

const BodyTopLine = styled.span`
  width: calc(100% + 12rem);
  height: 0.25rem;
  display: block;
  margin: 3rem -6rem;
  background-color: var(--color-blue-gray-25);
`;

const AllPermissionsContainerColumn = styled(ContainerColumn)`
  ${Combobox} {
    margin: 2rem 0 0 6.5rem;
  }
`;

const DisabledTooltip = styled(IconTooltip)`
  position: absolute;
  top: 3rem;
  right: 0;
`;
