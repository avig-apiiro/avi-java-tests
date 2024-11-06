import { observer } from 'mobx-react';
import { ChangeEvent, ReactNode } from 'react';
import styled from 'styled-components';
import { InputClickableLabel } from '@src-v2/components/forms/form-layout-v2';
import { Radio } from '@src-v2/components/forms/radio';
import { BaseIcon } from '@src-v2/components/icons';
import { Heading5, Heading6 } from '@src-v2/components/typography';
import { dataAttr } from '@src-v2/utils/dom-utils';

export type TileOptionType = {
  value: string;
  icon: ReactNode;
  label: string;
};

type RadioTilesSelectionProps = {
  title: string;
  selected: string;
  options: TileOptionType[];
  disabled?: boolean;
  onChange?: (value: string) => void;
};

export const RadioTilesSelection = observer(
  ({ title, selected, options, disabled, onChange, ...props }: RadioTilesSelectionProps) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event.target.value);
    };

    return (
      <Container {...props}>
        <Heading5>{title}</Heading5>
        <TilesContainer>
          {options.map((option: TileOptionType) => (
            <Label
              key={option.value}
              data-disabled={dataAttr(disabled)}
              data-selected={dataAttr(selected === option.value)}>
              <Radio
                disabled={disabled}
                value={option.value}
                onChange={handleChange}
                checked={selected === option.value}
              />
              <IconName>
                {option.icon}
                <Heading6>{option.label}</Heading6>
              </IconName>
            </Label>
          ))}
        </TilesContainer>
      </Container>
    );
  }
);

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const TilesContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4rem;
`;

const Label = styled(InputClickableLabel)`
  width: 34rem;
  height: 34rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 3rem;
  border: 0.25rem solid var(--color-blue-gray-25);
  border-radius: 3rem;
  gap: 2rem;

  &[data-disabled] {
    color: var(--color-blue-gray-35);
    border-color: var(--color-blue-gray-35);
  }

  &:not([data-disabled]) {
    cursor: pointer;

    ${BaseIcon} {
      color: var(--color-blue-gray-50);
    }

    &:hover {
      background-color: var(--color-blue-15);
      border: 0.25rem solid var(--color-blue-60);
    }

    &[data-selected] {
      background-color: var(--color-blue-25);
      border: 0.25rem solid var(--color-blue-60);

      ${BaseIcon} {
        color: var(--color-blue-gray-60);
      }
    }
  }
`;

const IconName = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;

  ${Heading5} {
    width: min-content;
    height: 8rem;
    display: flex;
    align-items: center;
    text-align: center;
  }

  ${BaseIcon} {
    --icon-size: 9rem;
  }
`;
