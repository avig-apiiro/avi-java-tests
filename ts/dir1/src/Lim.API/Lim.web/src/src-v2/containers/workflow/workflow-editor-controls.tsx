import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { IconButton, InlineButton } from '@src-v2/components/buttons';
import { Chip } from '@src-v2/components/chips';
import { ClampText } from '@src-v2/components/clamp-text';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { Combobox, Input } from '@src-v2/components/forms';
import {
  InputControl,
  RemoteSelectControl,
  SelectControl,
  SelectMenuControl,
} from '@src-v2/components/forms/form-controls';
import { Select } from '@src-v2/components/forms/select';
import { BaseIcon, SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { SelectMenu } from '@src-v2/components/select-menu';
import { Popover } from '@src-v2/components/tooltips/popover';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { useConvertDataForDisplay } from '@src-v2/containers/workflow/hooks/use-convert-data-for-display';
import { StubAny } from '@src-v2/types/stub-any';
import { Dropdown } from '@src/src-v2/components/dropdown';

interface WorkflowRemoteSelectControlProps {
  name: string;
  itemToString?: (item: any) => string;
  getIconName?: (item: any) => string;
  searchMethod: (args: any) => Promise<any>;
  selectedItems?: any[];
  multiple?: boolean;
  expandable?: boolean;
  clearable?: boolean;
  placeholder?: string;
  defaultValue?: any;
}

export const RemoveButton = styled(({ onClick, ...props }) => (
  <IconButton {...props} data-remove-button name="Trash" onClick={onClick} />
))`
  height: 100%;
  display: flex;
  align-items: center;

  ${SvgIcon as any} {
    min-width: 6rem;
  }
`;

export const WorkflowSelectControl = ({ chip = WorkflowChip, ...props }) => {
  const { watch } = useFormContext();

  useConvertDataForDisplay({
    name: props.name,
    defaultValue: props.defaultValue,
    multiple: props.multiple,
    items: props.items,
  });

  const value = watch(props.name);

  return props.multiple ? (
    <SelectControl
      {...props}
      key={value}
      clearable={false}
      chip={chip}
      shouldUnregisterOnUnmount={false}
      dropdownItem={data => (
        <DropdownItemWithAny itemToString={props.itemToString} name={props.name} {...data} />
      )}
    />
  ) : (
    <AutoWidthInputWrapper value={props.itemToString(value) ?? props.placeholder}>
      <SelectControl
        {...props}
        key={value}
        popover={WorkflowPopover}
        clearable={false}
        shouldUnregisterOnUnmount={false}
      />
    </AutoWidthInputWrapper>
  );
};

export const WorkflowRemoteSelectControl = ({
  multiple = true,
  expandable = false,
  clearable = false,
  getIconName = null,
  defaultValue = null,
  itemToString = _ => _,
  ...props
}: WorkflowRemoteSelectControlProps) => {
  const { getValues } = useFormContext();
  const value = getValues(props.name);

  return multiple ? (
    <RemoteSelectControl
      {...props}
      chip={({ selectedItem, ...props }: { selectedItem: StubAny }) => (
        <WorkflowChip key={selectedItem?.id} {...props}>
          <VendorIcon name={getIconName?.(selectedItem)} />{' '}
          {itemToString?.(selectedItem) ?? selectedItem}
        </WorkflowChip>
      )}
      expandable={expandable}
      multiple={multiple}
      clearable={false}
      itemToString={itemToString}
      dropdownItem={(data: StubAny) => (
        <DropdownItemWithAny
          {...data}
          name={props.name}
          iconName={getIconName?.(data.item)}
          itemToString={itemToString}
        />
      )}
      searchMethod={props.searchMethod}
      {...props}
    />
  ) : (
    <AutoWidthInputWrapper value={itemToString(value) ?? props.placeholder}>
      <RemoteSelectControl
        key={value}
        multiple={false}
        itemToString={itemToString}
        clearable={false}
        searchMethod={props.searchMethod}
        {...props}
      />
    </AutoWidthInputWrapper>
  );
};

export const WorkflowSelectMenuControl = styled(SelectMenuControl)`
  & ${SelectMenu.Button} {
    border-color: var(--color-blue-gray-25);
    border-radius: 2rem;
    height: 8rem;
  }

  ${InlineButton} {
    padding: 4rem;
  }

  ${BaseIcon}[data-risk-level] {
    margin-bottom: 1rem;
    margin-right: 2rem;
  }
`;

const DropdownItemWithAny = ({
  item,
  name,
  iconName,
  itemToString,
  ...props
}: {
  item?: any;
  name?: string;
  iconName?: string;
  itemToString?: (any: StubAny) => string;
}) => {
  const { setValue, watch } = useFormContext();

  const addSelection = () => {
    const filterAny = (values: StubAny[]) =>
      values.filter(value => value !== 'any' && value.key !== 'any');
    const selectedItems = watch(name) ?? [];
    const newSelection = item?.value;
    const isAnySelected = newSelection.key === 'any';

    if (isAnySelected) {
      setValue(name, [newSelection], { shouldDirty: true });
    } else {
      setValue(name, filterAny([...(selectedItems ?? []), newSelection]), { shouldDirty: true });
    }
  };

  return (
    <DropdownItemWrapper {...props} onClick={addSelection}>
      <VendorIcon name={iconName} /> <ClampText>{itemToString?.(item.value)}</ClampText>
    </DropdownItemWrapper>
  );
};

const AutoWidthInputWrapper = styled.div<{
  value?: { displayName?: string; name?: string } | string;
}>`
  ${Combobox.InputContainer} {
    ${Input} {
      font-size: 3.5rem;
      width: ${({ value }) => {
        if (!value) {
          return '40rem';
        }
        return `${
          12 +
          1.5 *
            (typeof value === 'object' ? value?.displayName ?? value?.name : value ?? '')?.length
        }rem`;
      }};

      padding-right: 2rem;
    }

    ${Select.SelectIconButton} {
      display: none;
    }

    & [data-name='Chevron'] {
      display: none;
    }
  }
`;

export const AddStepMenu = styled(props => (
  <DropdownMenu
    {...props}
    //To be removed after popover maxHeight logic is changed
    maxHeight="65rem"
    icon="PlusSmall"
    size={Size.XSMALL}
    variant={props.variant ?? Variant.PRIMARY}
  />
))`
  [data-display-only] & {
    display: none;
  }
`;

export const SubmitWorkflowButton = styled(props => {
  const {
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <div {...props}>
      <Button type="submit" size={Size.LARGE} variant={Variant.PRIMARY} loading={isSubmitting}>
        Save Workflow
      </Button>
    </div>
  );
})``;

export const WorkflowChip = (props: StubAny) => {
  const errorMessage = props.selectedItem?.errorMessage;

  return <Chip errorMessage={errorMessage} size={Size.MEDIUM} {...props} />;
};

const DropdownItemWrapper = styled(Dropdown.Item)`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const WorkflowPopover = styled(Combobox.Popover)`
  ${(Popover as any).Content} {
    max-width: 85rem;
    width: 100rem;
  }
`;

export const WorkflowFieldActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 2rem;
  margin-top: 2rem;
`;

export const WorkflowInputControl = styled(props => {
  return <InputControl {...props} />;
})`
  width: unset;
  max-width: 60rem;
  font-size: 3.5rem;
  z-index: 1;
`;

export const WorkflowLabel = styled.div`
  white-space: nowrap;
  align-items: center;
  height: 100%;
  margin: 2rem 0;
  font-size: 14px;
  font-weight: 400;
  z-index: 1;

  &[data-required]:after {
    content: '*';
    color: var(--color-red-50);
  }
`;

export const StepTitle = styled.div`
  font-size: 3.5rem;
  height: 9rem;
  width: 13rem;
  padding-right: 3rem;
  display: flex;
  align-items: center;
  z-index: 1;
  font-weight: 600;
  margin-top: 3.5rem;
`;

export const WorkflowStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3rem;
`;

export const WorkflowStepContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  border: 0.25rem solid var(--color-blue-gray-25);
  padding: 3rem;
  border-radius: 3rem;
  gap: 2rem;
`;

export const WorkflowField = styled.div`
  align-items: start;
  width: 100%;
  gap: 3rem;
  display: flex;
  flex-grow: 1;

  ${Chip} {
    padding: 0 2rem;
  }
`;

export const WorkflowStepWrapper = styled.div`
  display: flex;
  position: relative;
`;
