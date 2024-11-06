import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Divider } from '@src-v2/components/divider';
import { BaseIcon } from '@src-v2/components/icons';
import { Heading6 } from '@src-v2/components/typography';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

export type SubNavigationMenuOptionType = {
  key: string;
  label?: string;
  route?: string;
  isTitle?: boolean;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
  hidden?: boolean;
};

export type GroupedSubNavigationMenuOptionType = {
  key: string;
  label?: string;
  items: SubNavigationMenuOptionType[];
};

type SubNavigationMenuType = StyledProps & {
  options: SubNavigationMenuOptionType[];
  currentOption: SubNavigationMenuOptionType;
  onChange?: (option: SubNavigationMenuOptionType) => void;
  title?: string;
  isGroupedOptions?: boolean;
  allOptionLabel?: string;
};

const Title = styled.span`
  padding: 2.25rem 4rem;
  font-size: var(--font-size-s);
  color: var(--color-blue-gray-60);
  background-color: var(--color-blue-gray-20);
  border-top-left-radius: 3rem;
  border-top-right-radius: 3rem;
  border-bottom: 0.25rem solid var(--color-blue-gray-30);
`;

export const SubNavigationMenu = styled(
  observer(
    ({
      options,
      currentOption,
      title,
      allOptionLabel,
      isGroupedOptions,
      onChange,
      ...props
    }: SubNavigationMenuType) => {
      return (
        <div
          {...props}
          data-no-title={dataAttr(!title)}
          data-no-all={dataAttr(Boolean(!allOptionLabel))}>
          {Boolean(title) && <Title>{title}</Title>}
          {Boolean(allOptionLabel) && (
            <AllButtonOption>
              <Label
                data-selected={dataAttr(currentOption === null)}
                onClick={() => onChange?.(null)}>
                {allOptionLabel}
              </Label>
            </AllButtonOption>
          )}
          {isGroupedOptions ? (
            options
              .filter((option: GroupedSubNavigationMenuOptionType) =>
                option.items.some((item: SubNavigationMenuOptionType) => !item.hidden)
              )
              .map((option: GroupedSubNavigationMenuOptionType, index: number) => (
                <GroupedOptionContainer key={option.key}>
                  {index !== 0 && <Divider />}
                  <GroupedTitle>{option.label}</GroupedTitle>
                  <OptionsList
                    options={option.items}
                    onChange={onChange}
                    currentOption={currentOption}
                  />
                </GroupedOptionContainer>
              ))
          ) : (
            <OptionsList options={options} onChange={onChange} currentOption={currentOption} />
          )}
        </div>
      );
    }
  )
)`
  width: 54rem;
  height: fit-content;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  padding: 0 0 3rem 0;
  border: 0.25rem solid var(--color-blue-gray-30);
  border-radius: 3rem;
  background-color: var(--color-white);

  &[data-no-all] {
    &[data-no-title] {
      padding-top: 2rem;
    }

    ${Title} {
      margin-bottom: 2.5rem;
    }
  }

  ${Divider} {
    width: calc(100% - 6rem);
    margin: 3rem 0 3rem 3rem;
  }
`;

const Option = styled.span`
  display: flex;
  align-items: center;
  padding: 0.5rem 3rem;
`;

const OptionsList = styled(({ options, currentOption, onChange }) => {
  return options
    .filter((option: SubNavigationMenuOptionType) => !option.hidden)
    .map((option: SubNavigationMenuOptionType) => (
      <Option key={option?.key}>
        <Label
          as={option?.route ? Link : Label}
          to={option?.route}
          data-left-icon={dataAttr(Boolean(option.leftIcon))}
          data-selected={dataAttr(option.key === currentOption?.key)}
          onClick={() => onChange?.(option)}>
          <LeftIconTextContainer>
            {option.leftIcon}
            {option.label ?? option.key}
          </LeftIconTextContainer>
          {option.rightIcon && <RightIconContainer>{option.rightIcon}</RightIconContainer>}
        </Label>
      </Option>
    ));
})``;

const GroupedTitle = styled(Heading6)`
  padding: 1.5rem 5rem;
  color: var(--color-blue-gray-55);
`;

const Label = styled.label`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  font-size: var(--font-size-s);
  border-radius: 2rem;
  gap: 2rem;
  cursor: pointer;

  &:hover {
    background-color: var(--color-blue-gray-15);
  }

  &[data-left-icon] {
    padding-left: 1rem;
  }

  &[data-selected] {
    background-color: var(--color-blue-gray-20);
  }
`;

const AllButtonOption = styled(Option)`
  padding: 2rem 0;
  margin: 0 3rem 2rem;
  border-bottom: 0.25rem solid var(--color-blue-gray-25);
`;

const LeftIconTextContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const RightIconContainer = styled.span`
  display: flex;
  align-items: center;

  ${BaseIcon} {
    width: 4rem;
    height: 4rem;
  }
`;

const GroupedOptionContainer = styled.span``;
