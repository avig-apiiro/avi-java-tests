import { uniq } from 'lodash';
import {
  ChangeEvent,
  ComponentType,
  FC,
  InputHTMLAttributes,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Control, Controller, RegisterOptions, useFormContext } from 'react-hook-form';
import { GroupBase } from 'react-select/dist/declarations/src/types';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { InlineButton, TextIconButton } from '@src-v2/components/buttons';
import { Dropdown } from '@src-v2/components/dropdown';
import { CalendarDatePicker } from '@src-v2/components/forms/calendar-date-picker';
import { Checkbox, CheckboxProps } from '@src-v2/components/forms/checkbox';
import {
  BaseListBoxItem,
  DualListBox,
  DualListBoxProps,
} from '@src-v2/components/forms/dual-list-box';
import { ErrorTypeMapping, FieldErrorDisplay } from '@src-v2/components/forms/field-error-display';
import { InputV2 } from '@src-v2/components/forms/inputV2';
import { MultiSelect } from '@src-v2/components/forms/multi-select';
import { Radio } from '@src-v2/components/forms/radio';
import { Select } from '@src-v2/components/forms/select';
import { TextAreaProps, Textarea } from '@src-v2/components/forms/textarea';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { SelectMenu } from '@src-v2/components/select-menu';
import { CommonSelectProps } from '@src-v2/components/select/select-props';
import { SelectV2, SelectV2Props } from '@src-v2/components/select/select-v2';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { EllipsisText, Heading5, SubHeading4 } from '@src-v2/components/typography';
import { SearchCombobox } from '@src-v2/containers/search-combobox';
import { SelectInput } from '@src-v2/containers/select-input';
import { useGroupProperties } from '@src-v2/hooks';
import { SearchParams } from '@src-v2/services';
import { StubAny } from '@src-v2/types/stub-any';
import { toggleValues } from '@src-v2/utils/collection-utils';
import { formatDate } from '@src-v2/utils/datetime-utils';
import { dataAttr } from '@src-v2/utils/dom-utils';

const ControlAttributes = ['name', 'rules', 'control', 'defaultValue'];
type BaseControlProps = {
  name: string;
  defaultValue?: any;
  rules?: RegisterOptions;
  control?: Control;
};

interface InputControlProps
  extends Partial<Omit<InputHTMLAttributes<HTMLInputElement>, 'defaultValue'>> {
  name: string;
  rules?: RegisterOptions;
  control?: Control;
  defaultValue?: ReactNode;
  onClearClicked?: () => void;
}

export interface ItemProps<T = string> {
  label: string;
  value?: T;
  key?: string;
  titleText?: string;
  icon?: ReactNode;
}

interface SelectControlProps {
  name?: string;
  onSelect?: (e: Event) => void;
  onInput?: (e: Event) => void;
  placeholder?: string;
  shouldSplitInputValue?: boolean;
  multiple?: boolean;
  selectedItems?: string[];
  items?: ItemProps[] | string[] | any[];
  rules?: RegisterOptions;
  label?: string;
  icon?: ReactNode;
  popover?: ReactNode;
  clearable?: boolean;
  creatable?: boolean;
  chip?: ComponentType;
  dropdownItem?: ComponentType;
  defaultValue?: ItemProps | ItemProps[] | string;
  itemToString?: (any: StubAny) => string;
  appendTo?: string;
  expandable?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
  renderItemContent?: FC<{ item: { label: string; value: any } }>;
  shouldUnregisterOnUnmount?: boolean;
  itemSelector?: (selectedItems: any) => any | any[];
}

export type DualListBoxControlProps<TItem, TSearchParams = Partial<SearchParams>> = {
  name: string;
  itemTypeDisplayName?: string;
  rules?: RegisterOptions;
  control?: Control;
  onChange?: DualListBoxProps<TItem, TSearchParams>['onChange'];
} & Omit<DualListBoxProps<TItem, TSearchParams>, 'onChange' | 'itemTypeDisplayName'>;

interface TextareaControlProps extends TextAreaProps {
  rules?: RegisterOptions;
}

export function InputControl({
  type = 'text',
  defaultValue = '',
  onChange: externalOnChange,
  onClearClicked,
  ...props
}: InputControlProps) {
  const [controllerProps, inputProps] = useGroupProperties(props, ControlAttributes);

  const { setValue } = useFormContext();

  const preventFormDefaults = useCallback((event: StubAny) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }, []);

  return (
    <Controller
      {...controllerProps}
      defaultValue={defaultValue}
      render={({ field: { value, onChange, ...field }, fieldState: { error } }) => {
        return (
          <InputV2
            {...field}
            {...inputProps}
            value={value}
            type={type}
            onKeyDown={preventFormDefaults}
            error={error}
            onClearClicked={
              onClearClicked ?? (() => setValue(props.name, '', { shouldValidate: true }))
            }
            onChange={event => {
              onChange(event);
              externalOnChange?.(event);
            }}
          />
        );
      }}
    />
  );
}

export const TextareaControl = ({ ...props }: TextareaControlProps) => {
  const [controllerProps, textAreaProps] = useGroupProperties(props, ControlAttributes);

  return (
    <Controller
      {...controllerProps}
      render={({ field: { value, ...field }, fieldState: { error } }) => {
        return <Textarea {...field} {...textAreaProps} value={value ?? ''} error={error} />;
      }}
    />
  );
};

export function CheckboxControl({
  Component = Checkbox,
  analyticsData,
  ...props
}: {
  Component?: ComponentType<any>;
  analyticsData?: Partial<Record<AnalyticsDataField, string>>;
} & InputControlProps &
  CheckboxProps) {
  const [controllerProps, inputProps] = useGroupProperties(props, ControlAttributes);
  const trackAnalytics = useTrackAnalytics();

  const handleCheckboxToggle = (event: ChangeEvent<HTMLInputElement>) => {
    const isEnabled = event.target.checked;
    if (!analyticsData) {
      return;
    }
    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.ActionValue]: isEnabled ? 'Enabled' : 'Disabled',
      ...analyticsData,
    });
  };
  return (
    <Controller
      {...controllerProps}
      render={({ field: { value, onChange, ...field } }) => (
        <Component
          {...field}
          {...inputProps}
          checked={value ?? false}
          onChange={(event: StubAny) => {
            handleCheckboxToggle(event);
            onChange(event);
          }}
        />
      )}
    />
  );
}

export function RadioControl({ value, ...props }: { value: StubAny } & BaseControlProps) {
  const [controllerProps, radioProps] = useGroupProperties(props, ControlAttributes);
  return (
    <Controller
      {...controllerProps}
      render={({ field: { value: checkedValue, ...field } }) => (
        <Radio {...field} {...radioProps} value={value} checked={checkedValue === value} />
      )}
    />
  );
}

export function SelectControlV2<
  TOption,
  TMulti extends boolean,
  TGroup extends GroupBase<TOption>,
>({ onChange, ...props }: BaseControlProps & SelectV2Props<TOption, TMulti, TGroup>) {
  const [controllerProps, selectProps] = useGroupProperties(props, ControlAttributes) as [
    BaseControlProps,
    CommonSelectProps<TOption, TMulti, TGroup>,
  ];

  return (
    <Controller
      {...controllerProps}
      key={props.name}
      render={({ field: { value, onChange: formOnChange, ref }, fieldState: { error } }) => (
        <SelectV2
          {...selectProps}
          innerRef={ref}
          invalid={
            error?.message
              ? error.message.toString()
              : ErrorTypeMapping[error?.type as keyof typeof ErrorTypeMapping]
          }
          value={value}
          onChange={(value: StubAny) => {
            formOnChange(value);
            onChange?.(value);
          }}
        />
      )}
    />
  );
}

/**
 * @deprecated use <SelectControlV2 /> instead
 */
export function SelectControl({
  onSelect = null,
  shouldSplitInputValue = false,
  multiple = false,
  shouldUnregisterOnUnmount = true,
  disabled = false,
  searchable = true,
  itemSelector,
  selectedItems,
  ...props
}: SelectControlProps) {
  const [controllerProps, inputProps] = useGroupProperties(props, ControlAttributes);
  const { unregister, trigger } = useFormContext();

  const createSelected = (event: StubAny) => {
    if (itemSelector) {
      return itemSelector(multiple ? event.selectedItems : event.selectedItem);
    }

    if (multiple) {
      if (shouldSplitInputValue) {
        return uniq(
          event.selectedItems?.flatMap((item: StubAny) =>
            typeof item === 'string' ? item : item.value.split(/\s*[,\n; ]+\s*/)
          )
        );
      }
      return event.selectedItems;
    }
    return event.selectedItem;
  };

  useEffect(() => {
    return () => {
      if (shouldUnregisterOnUnmount) {
        unregister(props.name);
      }
    };
  }, [props.name, unregister]);

  return (
    <Controller
      {...controllerProps}
      render={({ field: { onChange, ...field }, fieldState: { error } }) => {
        return (
          <SearchComboboxContainer>
            <SearchCombobox
              {...field}
              {...inputProps}
              multiple={multiple}
              error={error}
              disabled={disabled}
              searchable={searchable}
              as={multiple ? MultiSelect : Select}
              selectedItems={selectedItems ?? field.value ?? []}
              shouldSplitInputValue={shouldSplitInputValue}
              onSelect={(event: StubAny) => {
                onChange(createSelected(event));
                void trigger(props.name);
                onSelect?.(event);
              }}
              onClear={() => {
                onChange(null);
                void trigger(props.name);
              }}
            />
            <FieldErrorDisplay error={error} />
          </SearchComboboxContainer>
        );
      }}
    />
  );
}

const SearchComboboxContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

export function RemoteSelectControl({
  multiple = false,
  searchMethod,
  onSelect,
  ...props
}: {
  multiple: boolean;
  searchMethod: StubAny;
  onSelect?: StubAny;
} & SelectControlProps) {
  const [controllerProps, inputProps] = useGroupProperties(props, ControlAttributes);

  return (
    <Controller
      {...controllerProps}
      render={({ field: { onChange, ...field } }) => {
        return (
          <SelectInput
            {...field}
            selectedItems={field.value ?? []}
            {...inputProps}
            searchMethod={searchMethod}
            as={multiple ? MultiSelect : Select}
            multiple={multiple}
            onSelect={(event: StubAny) => {
              onChange(multiple ? event.selectedItems : event.selectedItem);
              onSelect?.(event);
            }}
          />
        );
      }}
    />
  );
}

type RadioGroupControlProps = {
  options: (
    | string
    | { value: string; label: string; disabled?: boolean; disableReason?: string }
  )[];
  size?: Size.SMALL | Size.MEDIUM;
  horizontal?: boolean;
  disabled?: boolean;
} & BaseControlProps;

export function RadioGroupControl({
  options,
  size = Size.MEDIUM,
  rules = {},
  disabled = false,
  horizontal = false,
  ...props
}: RadioGroupControlProps) {
  const [controllerProps, containerProps] = useGroupProperties(props, ControlAttributes);
  return (
    <Controller
      {...controllerProps}
      rules={rules}
      render={({ field: { value: checkedValue, ...field } }) => (
        <GroupControlContainer data-horizontal={dataAttr(horizontal)} {...containerProps}>
          {options.map(optionOrValue => {
            const {
              value,
              label,
              disabled: optionDisabled,
              disableReason,
            } = typeof optionOrValue === 'string'
              ? {
                  value: optionOrValue,
                  label: optionOrValue,
                  disabled: false,
                  disableReason: undefined,
                }
              : optionOrValue;

            return (
              <RadioGroupControl.Label
                key={value}
                data-size={size}
                data-disabled={dataAttr(optionDisabled || disabled, 'true')}>
                <Radio
                  {...field}
                  value={value}
                  checked={checkedValue === value}
                  disabled={optionDisabled || disabled}
                />
                <Tooltip content={disableReason} disabled={!optionDisabled}>
                  <span>{label}</span>
                </Tooltip>
              </RadioGroupControl.Label>
            );
          })}
        </GroupControlContainer>
      )}
    />
  );
}

export function CheckboxGroupControl({
  options,
  disabled,
  ...props
}: {
  name: string;
  options: {
    value: string;
    label?: string;
    description?: string;
    disabled?: boolean;
    optionDisabledText?: string;
  }[];
  disabled?: boolean;
}) {
  const [controllerProps, containerProps] = useGroupProperties(props, ControlAttributes);

  return (
    <Controller
      {...controllerProps}
      render={({ field: { value: checkedValues, onChange, ...field } }) => (
        <GroupControlContainer {...containerProps}>
          {options.map(
            ({ value, label, description, disabled: optionDisabled, optionDisabledText }) => (
              <Tooltip content={optionDisabledText} disabled={!optionDisabled}>
                <CheckboxGroupControl.Label
                  key={value}
                  data-disabled={dataAttr(disabled || optionDisabled)}
                  data-has-description={dataAttr(Boolean(description))}>
                  <Checkbox
                    {...field}
                    onChange={event =>
                      onChange({
                        ...event,
                        target: { value: toggleValues(checkedValues, value) },
                      })
                    }
                    checked={checkedValues?.includes(value)}
                    disabled={disabled || optionDisabled}
                    value={label}
                  />
                  <CheckboxOptionContainer>
                    <Heading5>{label ?? value}</Heading5>
                    <SubHeading4>{description}</SubHeading4>
                  </CheckboxOptionContainer>
                </CheckboxGroupControl.Label>
              </Tooltip>
            )
          )}
        </GroupControlContainer>
      )}
    />
  );
}

export function SelectMenuControl({
  items,
  renderItem = (item: StubAny) => item.displayName,
  onItemClick = null,
  isItemDisabled = null,
  disabledTooltip: DisabledTooltip,
  placeholderText = 'Select...',
  ...props
}: {
  items: StubAny[];
  renderItem?: StubAny;
  onItemClick?: StubAny;
  isItemDisabled?: StubAny;
  disabledTooltip?: StubAny;
  placeholderText?: string;
}) {
  const [controllerProps, containerProps] = useGroupProperties(props, ControlAttributes);
  const { watch, setValue } = useFormContext();
  const value = watch(controllerProps.name);

  return (
    <Controller
      {...controllerProps}
      render={() => (
        <div {...containerProps}>
          <SelectMenu
            {...props}
            disabled={items.length === 0}
            placeholder={renderItem(value) ?? placeholderText}>
            <Dropdown.Group>
              {items.map(item => {
                const isDisabled = isItemDisabled?.(item);
                return (
                  <ItemWrapper>
                    <Dropdown.Item
                      disabled={isDisabled}
                      onClick={() => {
                        onItemClick?.(item);
                        setValue(controllerProps.name, item);
                      }}>
                      {renderItem(item)}
                    </Dropdown.Item>
                    {isDisabled && (
                      <Tooltip interactive content={<DisabledTooltip item={item} />}>
                        <SvgIcon name="Info" />
                      </Tooltip>
                    )}
                  </ItemWrapper>
                );
              })}
            </Dropdown.Group>
          </SelectMenu>
        </div>
      )}
    />
  );
}

export const DualListBoxControl = <TItem extends BaseListBoxItem, TSearchParams>({
  name,
  itemTypeDisplayName,
  ...props
}: DualListBoxControlProps<TItem, TSearchParams>) => {
  return (
    <Controller
      name={name}
      render={({ field: { value, onChange } }) => (
        <DualListBox
          {...props}
          itemTypeDisplayName={itemTypeDisplayName ?? name}
          defaultValues={value}
          onChange={onChange}
        />
      )}
    />
  );
};

export function DatePickerControl({
  maxDate = null,
  minDate = null,
  ...props
}: {
  maxDate: Date | null;
  minDate: Date | null;
}) {
  const [controllerProps, containerProps] = useGroupProperties(props, ControlAttributes);
  const { watch } = useFormContext();
  const { [controllerProps.name]: dateValue } = watch();

  return (
    <Controller
      {...controllerProps}
      render={({ field: { onChange } }) => (
        <DateControlContainer {...containerProps}>
          <SelectMenu
            data-selected={dataAttr(dateValue)}
            icon="Calendar"
            placeholder={dateValue ? formatDate(dateValue, 'daily') : 'Select Date...'}>
            <CalendarDatePicker
              {...props}
              onChange={event => onChange({ ...event, target: { value: event } })}
              maxDate={maxDate}
              minDate={minDate}
              selectRange={false} //TODO: This component only supports picking a single date, add the option to select a range
            />
          </SelectMenu>
        </DateControlContainer>
      )}
    />
  );
}

export const UploadFileControl = styled(
  ({ accept, label = 'Select file', maxSize = 5, ...props }) => {
    const [controllerProps, inputProps] = useGroupProperties(props, ControlAttributes);
    const [file, setFile] = useState(null);
    const [sizeExceeded, setSizeExceeded] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>();

    const handleFileChange = useCallback(
      (event: StubAny) => {
        if (event.target.files) {
          const [uploadedFile] = event.target.files;
          const size = uploadedFile ? uploadedFile.size / 1024 ** 2 : 0; // in MB

          if (size > maxSize) {
            setSizeExceeded(true);
            fileInputRef.current.value = '';
            setFile(null);
            return;
          }

          setSizeExceeded(false);
          setFile(event.target.files[0]);
        }
      },
      [fileInputRef.current]
    );

    const handleRemoveFile = useCallback(
      (event: StubAny) => {
        event.preventDefault();
        fileInputRef.current.value = '';
        setSizeExceeded(false);
        setFile(null);
      },
      [fileInputRef.current]
    );

    return (
      <Controller
        {...controllerProps}
        render={({ field: { value, onChange, ...field }, fieldState: { error } }) => (
          <>
            <label
              {...inputProps}
              onChange={event => {
                // @ts-expect-error
                onChange(event.target?.files?.[0]);
                handleFileChange(event);
              }}>
              <input {...field} ref={fileInputRef} type="file" accept={accept} hidden />
              <TextIconButton
                data-file={dataAttr(Boolean(file))}
                button={InlineButton}
                iconName={file ? 'Close' : 'UploadFile'}
                onIconClick={
                  file
                    ? (event: StubAny) => {
                        onChange(null);
                        handleRemoveFile(event);
                      }
                    : null
                }>
                <Tooltip content={file?.name} disabled={!file?.name}>
                  <EllipsisText>{file?.name ?? label}</EllipsisText>
                </Tooltip>
              </TextIconButton>
            </label>
            <FieldErrorDisplay
              error={sizeExceeded ? { message: `The file exceeds the ${maxSize}Mb limit` } : error}
            />
          </>
        )}
      />
    );
  }
)`
  width: fit-content;
  max-width: 170rem;
  height: 8rem;
  display: flex;
  flex-direction: column;
  padding-right: 6rem;
  gap: 1rem;

  ${BaseIcon} {
    width: 5rem;
    min-width: 5rem;
    height: 5rem;
    margin-right: 0;
  }
`;

export const GroupControlContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  &[data-horizontal] {
    flex-direction: row;
    gap: 4rem;
  }
`;

const DateControlContainer = styled.div`
  ${SelectMenu.Button} {
    border: 0.25rem solid var(--color-blue-gray-30);
    border-radius: 1rem;
    color: var(--color-blue-gray-50);

    ${BaseIcon} {
      width: 4rem;
      height: 4rem;
      color: var(--color-blue-gray-50);
    }

    &[data-selected] {
      color: var(--color-blue-gray-70);
    }
  }
`;

export const BaseGroupItemLabel = styled.label`
  width: fit-content;
  cursor: pointer;

  ${Radio},
  ${Checkbox} {
    margin-right: 2rem;
  }

  &[data-disabled] {
    color: var(--color-blue-gray-40);
    cursor: default;
  }

  &[data-size=${Size.SMALL}] {
    font-size: var(--font-size-s);
  }
}
`;

RadioGroupControl.Label = BaseGroupItemLabel;

CheckboxGroupControl.Label = styled(BaseGroupItemLabel)`
  display: flex;
  align-items: center;

  &[data-has-description] {
    ${Checkbox} {
      bottom: 2.25rem;
    }
  }
`;

const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${BaseIcon}[data-name="Info"] {
    margin: 2rem 2rem 0;
  }
`;

const CheckboxOptionContainer = styled.div`
  display: flex;
  flex-direction: column;
`;
