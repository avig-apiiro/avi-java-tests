import { ReactNode, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button, CircleButton } from '@src-v2/components/button-v2';
import { Checkbox } from '@src-v2/components/forms';
import { SvgIcon } from '@src-v2/components/icons';
import { Popover } from '@src-v2/components/tooltips/popover';
import { Size } from '@src-v2/components/types/enums/size';
import { ListItem, UnorderedList } from '@src-v2/components/typography';
import { useToggle } from '@src-v2/hooks';

export interface FieldItem {
  key: string;
  label: ReactNode | string;
}

export const AdditionalFieldsMenu = ({
  fields,
  checkedFieldKeys = [],
  renderItem = (item: FieldItem) => <>{item.label}</>,
  onChange,
  selectText = 'Apply',
}: {
  fields: any[];
  checkedFieldKeys: FieldItem[];
  renderItem?: (item: FieldItem) => ReactNode | string;
  onChange?: (checkItems: FieldItem[]) => void;
  selectText?: string;
}) => {
  const [isVisible, toggleVisible] = useToggle();
  const [checkedKeys, setCheckedKeys] = useState<FieldItem[]>(checkedFieldKeys);

  useEffect(() => {
    setCheckedKeys(checkedFieldKeys);
  }, [checkedFieldKeys.length]);

  const isFieldChecked = useCallback(
    (field: FieldItem) => Boolean(checkedKeys?.find(checkedKey => checkedKey.key === field.key)),
    [checkedKeys]
  );

  const handleCheckItem = useCallback(
    (field: FieldItem) => {
      if (isFieldChecked(field)) {
        setCheckedKeys(checkedKeys.filter(checkedKey => checkedKey.key !== field.key));
      } else {
        setCheckedKeys([...checkedKeys, field]);
      }
    },
    [checkedKeys, setCheckedKeys]
  );

  const handleSelect = useCallback(() => {
    onChange?.(checkedKeys);
    toggleVisible(false);
  }, [checkedKeys, onChange]);

  return (
    <FieldsPopover
      noArrow
      maxHeight="100%"
      placement="top-start"
      content={
        <>
          <UnorderedList>
            {fields?.map(field => (
              <ListItem key={field.key}>
                <Label>
                  <Checkbox
                    checked={isFieldChecked(field)}
                    onChange={() => handleCheckItem(field)}
                  />
                  {renderItem(field)}
                </Label>
              </ListItem>
            ))}
          </UnorderedList>
          <Button onClick={handleSelect}>{selectText}</Button>
        </>
      }
      visible={isVisible}
      onClickOutside={toggleVisible}>
      <ActionButton>
        <CircleButton size={Size.XSMALL} onClick={toggleVisible}>
          <SvgIcon name="Plus" />
        </CircleButton>
        Additional fields
      </ActionButton>
    </FieldsPopover>
  );
};

const FieldsPopover = styled(Popover)`
  ${Popover.Content} {
    display: flex;
    min-width: 55rem;
    flex-direction: column;

    ${UnorderedList} {
      padding: 3rem 0;
      border-bottom: 0.25rem solid var(--color-blue-gray-25);
    }

    > ${Button} {
      align-self: flex-end;
      height: 6rem;
    }
  }
`;

const Label = styled.label`
  display: block;
  width: 100%;
  cursor: pointer;
  font-size: var(--font-size-s);

  ${Checkbox} {
    margin-right: 3rem;
  }
`;

const ActionButton = styled.label`
  display: flex;
  gap: 1rem;
  width: fit-content;

  :hover {
    cursor: pointer;
  }
`;
