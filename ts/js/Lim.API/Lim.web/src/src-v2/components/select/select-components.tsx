import _ from 'lodash';
import { useMemo } from 'react';
import {
  ClearIndicatorProps,
  ContainerProps,
  DropdownIndicatorProps,
  GroupProps,
  MultiValueGenericProps,
  MultiValueRemoveProps,
  OptionProps,
  components as ReactSelectComponents,
  SingleValueProps,
  components,
} from 'react-select';
import { MenuProps } from 'react-select/dist/declarations/src/components/Menu';
import { LoadingIndicatorProps } from 'react-select/dist/declarations/src/components/indicators';
import { GroupBase } from 'react-select/dist/declarations/src/types';
import styled from 'styled-components';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { CircleButton } from '@src-v2/components/button-v2';
import { Chip } from '@src-v2/components/chips';
import { Divider } from '@src-v2/components/divider';
import { Dropdown } from '@src-v2/components/dropdown';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Caption1 } from '@src-v2/components/typography';
import { customScrollbar } from '@src-v2/style/mixins';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { isTypeOf } from '@src-v2/utils/ts-utils';

const ClearIndicator = (props: ClearIndicatorProps) => {
  return (
    <ReactSelectComponents.ClearIndicator {...props}>
      <CircleButton size={Size.XSMALL} variant={Variant.TERTIARY} onClick={_.noop}>
        <SvgIcon name="CloseLarge" />
      </CircleButton>
    </ReactSelectComponents.ClearIndicator>
  );
};

const Control = styled(ReactSelectComponents.Control)`
  background-color: var(--color-white);
  font-size: var(--font-size-s);
  border: 0.25rem solid var(--color-blue-gray-30);
  border-radius: 2rem;
  min-height: 9rem !important;
  line-height: 5rem !important;
  padding: 1rem 3rem;

  [data-size=${Size.SMALL}] & {
    min-height: 8rem !important;
  }

  &:hover {
    border-color: var(--color-blue-gray-50);
    cursor: ${props => (props.selectProps?.isSearchable ? 'text' : 'pointer')};

    ${BaseIcon} {
      cursor: pointer;
    }
  }

  &:has(:focus) {
    border-color: var(--color-blue-65);
  }

  ${BaseIcon}[data-name='Chevron'] {
    color: var(--color-blue-gray-50);
    transform: rotate(90deg);
    transition: transform 400ms;

    &[data-open] {
      transform: rotate(-90deg);
    }
  }
`;

const DropdownIndicator = (props: DropdownIndicatorProps) => {
  return (
    <ReactSelectComponents.DropdownIndicator {...props}>
      <SvgIcon
        name="Chevron"
        size={Size.XSMALL}
        data-open={dataAttr(props.selectProps.menuIsOpen)}
      />
    </ReactSelectComponents.DropdownIndicator>
  );
};

const IndicatorsContainer = styled(ReactSelectComponents.IndicatorsContainer)`
  max-height: 6.5rem;
`;

const MenuList = styled(ReactSelectComponents.MenuList)``;

const Menu = styled(({ children, innerProps, ...props }: MenuProps) => (
  <ReactSelectComponents.Menu
    {...props}
    innerProps={{
      ...innerProps,
      // @ts-expect-error
      'data-select-menu': dataAttr(true),
      'data-floating-element': dataAttr(true),
    }}>
    {children}
  </ReactSelectComponents.Menu>
))`
  margin-top: 1rem;
  border-radius: 3rem;
  box-shadow: var(--elevation-6);
  background-color: var(--color-white);
  animation: fade-in 200ms ease-in-out;

  ${MenuList} {
    max-height: 55rem;
    overflow: auto;
    padding: 3rem;

    ${Dropdown.Item} {
      display: flex;
      align-items: center;
      gap: 1rem;

      &:not(:last-child) {
        margin-bottom: 1rem;
      }
    }
  }
` as typeof ReactSelectComponents.Menu;

const MultiValueContainer = ({ children, ...props }: MultiValueGenericProps) => (
  <ReactSelectComponents.MultiValueContainer {...props}>
    <Chip>{children}</Chip>
  </ReactSelectComponents.MultiValueContainer>
);

const MultiValueLabel = ({ children, ...props }: MultiValueGenericProps) => {
  const ValueLabel = props.selectProps.label ?? props.selectProps.option;

  return ValueLabel ? (
    <components.MultiValueLabel {...props}>
      <ValueLabel data={props.data} />
    </components.MultiValueLabel>
  ) : (
    <components.MultiValueLabel {...props}>{children}</components.MultiValueLabel>
  );
};

const MultiValueRemove = (props: MultiValueRemoveProps) => (
  <ReactSelectComponents.MultiValueRemove {...props}>
    <Chip.RemoveButton />
  </ReactSelectComponents.MultiValueRemove>
);

const GroupDivider = styled(Divider)`
  margin: 1rem 0;
  width: 100%;
`;

const Group = styled(({ children, ...props }: GroupProps) => {
  const shouldShowDivider = useMemo(() => {
    if (!props.data.options?.length) {
      return false;
    }

    const nonEmptyGroups = props.selectProps.options.filter(
      option => !isTypeOf<GroupBase<any>>(option, 'options') || Boolean(option.options?.length)
    );

    return nonEmptyGroups.length - 1 !== nonEmptyGroups.indexOf(props.data);
  }, [props.selectProps.options, props.data]);

  return (
    <components.Group {...props}>
      {children}
      {shouldShowDivider && <GroupDivider />}
    </components.Group>
  );
})``;

const Option = ({ children, ...props }: OptionProps) => {
  const OptionContent = props.selectProps.option;
  return (
    <components.Option {...props}>
      <Dropdown.Item
        selected={props.isSelected}
        disabled={props.isDisabled}
        className={props.className}>
        {OptionContent ? <OptionContent data={props.data} /> : children}
      </Dropdown.Item>
    </components.Option>
  );
};

const Placeholder = styled(ReactSelectComponents.Placeholder)`
  color: var(--color-blue-gray-50);
  font-weight: 300;
`;

const LoadingIndicator = styled(({ className, innerProps }: LoadingIndicatorProps) => (
  <LogoSpinner {...innerProps} className={className} />
))`
  height: 5rem;
`;

const InvalidMessageContainer = styled.div`
  display: flex;
  margin-top: 1rem;
  gap: 1rem;

  ${BaseIcon} {
    color: var(--color-red-50);
  }
`;

const SelectContainer = styled(({ children, innerProps, ...props }: ContainerProps) => {
  const { size = Size.MEDIUM, invalid } = props.selectProps;

  return (
    <ReactSelectComponents.SelectContainer
      {...props}
      innerProps={{
        // @ts-expect-error
        'data-size': size?.toString(),
        'data-invalid': dataAttr(Boolean(invalid)),
        'data-multiple': dataAttr(props.isMulti),
        'data-disabled': dataAttr(props.isDisabled),
        ...innerProps,
      }}>
      {children}
      {typeof invalid === 'string' && (
        <InvalidMessageContainer>
          <SvgIcon name="Warning" size={Size.XSMALL} />
          <Caption1>{invalid}</Caption1>
        </InvalidMessageContainer>
      )}
    </ReactSelectComponents.SelectContainer>
  );
})`
  max-width: 240rem;

  &[data-multiple] ${Control} {
    max-height: 55rem;
    overflow: auto;

    ${customScrollbar}
  }

  &[data-disabled] ${Control} {
    border-color: var(--color-blue-gray-30);
    color: var(--color-blue-gray-35);

    ${Placeholder} {
      color: var(--color-blue-gray-35);
    }

    ${IndicatorsContainer} {
      ${BaseIcon} {
        color: var(--color-blue-gray-35);
      }
    }
  }

  &[data-invalid] ${Control} {
    border-color: var(--color-red-55);

    &:focus {
      border-color: var(--color-red-65);
    }

    &:hover {
      border-color: var(--color-red-60);
    }
  }
`;

const ValueContainer = styled(ReactSelectComponents.ValueContainer)`
  display: flex;
  gap: 2rem;
` as typeof ReactSelectComponents.ValueContainer;

const SingleValueContainer = styled(ReactSelectComponents.SingleValue)`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const SingleValue = (props: SingleValueProps) => {
  const ValueLabel = props.selectProps.label ?? props.selectProps.option;

  return ValueLabel ? (
    <SingleValueContainer {...props}>
      <ValueLabel data={props.data} />
    </SingleValueContainer>
  ) : (
    <SingleValueContainer {...props} />
  );
};

export const selectComponents = {
  ...ReactSelectComponents,
  ClearIndicator,
  Control: Control as typeof ReactSelectComponents.Control,
  DropdownIndicator,
  IndicatorsContainer,
  Group,
  LoadingIndicator,
  Menu,
  MenuList: MenuList as typeof ReactSelectComponents.MenuList,
  MultiValueContainer,
  MultiValueLabel,
  MultiValueRemove,
  Option,
  SelectContainer,
  SingleValue,
  Placeholder,
  ValueContainer,
} as typeof ReactSelectComponents;
