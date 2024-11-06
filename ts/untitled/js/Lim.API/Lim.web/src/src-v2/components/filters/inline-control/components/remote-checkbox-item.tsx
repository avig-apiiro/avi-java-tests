import styled from 'styled-components';
import { ClampText } from '@src-v2/components/clamp-text';
import { Dropdown } from '@src-v2/components/dropdown';
import { includesValue } from '@src-v2/components/filters/menu-control/filters-menu';
import { VendorIcon } from '@src-v2/components/icons';
import { ActiveFiltersData, FilterOption } from '@src-v2/hooks/use-filters';

interface RemoteCheckboxItemProps {
  filterKey: string;
  option: FilterOption;
  activeValues: ActiveFiltersData;
  onChange: (option, event) => void;
}

export const RemoteCheckboxItem = ({
  filterKey,
  option,
  activeValues,
  onChange,
}: RemoteCheckboxItemProps) => {
  return (
    <Dropdown.CheckboxItem
      checked={includesValue(activeValues?.[filterKey], option.key)}
      onChange={event =>
        onChange?.(
          {
            key: filterKey,
            value: option.key,
            checked: event.target.checked,
            multiple: true,
          },
          event
        )
      }>
      <RemoteCheckboxItemWrapper>
        {option.provider && <VendorIcon name={option.provider} />}
        <ClampText>{option.title}</ClampText>
      </RemoteCheckboxItemWrapper>
    </Dropdown.CheckboxItem>
  );
};

const RemoteCheckboxItemWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;
