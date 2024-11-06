import { useRef } from 'react';
import styled from 'styled-components';
import { Collapsible } from '@src-v2/components/collapsible';
import { useCustomDate } from '@src-v2/components/filters/hooks/use-custom-date';
import { Input, Radio } from '@src-v2/components/forms';
import { CalendarDatePicker } from '@src-v2/components/forms/calendar-date-picker';
import { useCollapsible } from '@src-v2/hooks/use-collapsible';
import { dataAttr } from '@src-v2/utils/dom-utils';

type CalendarDatePickerFilterPropsType = {
  date: Date;
  options: number[];
  defaultOpen?: boolean;
  onChange?: () => void;
};

export const CalendarDatePickerFilter = ({
  date,
  options = [7, 14, 30, 90],
  defaultOpen,
  onChange: handleChange,
  ...props
}: CalendarDatePickerFilterPropsType) => {
  const refs = useRef({ calendar: null, from: null, to: null });

  const {
    isCustom,
    customDate,
    activeStartDate,
    setActiveStartDate,
    handleDateChange,
    handleRadioChange,
    handleCustomInputEnter,
    handleCustomInputChange,
    handleCustomInputSubmit,
  } = useCustomDate({ date, refs, handleChange });

  const { getContentProps } = useCollapsible({ open: isCustom });

  return (
    <Container {...props} data-status={dataAttr(isCustom, 'custom')} onChange={handleRadioChange}>
      <Label>
        <Radio name="days-option" value={-1} defaultChecked={!isCustom} />
        <Option>All</Option>
      </Label>
      {options.map(option => (
        <Label key={option}>
          <Radio name="days-option" value={option} />
          <Option>Last {option} days</Option>
        </Label>
      ))}
      <Label>
        <Radio name="days-option" value="custom-days" defaultChecked={isCustom} />
        From
        <Input
          ref={ref => (refs.current.from = ref)}
          name="custom-from"
          placeholder="yyyy-mm-dd"
          value={customDate.from ?? ''}
          onBlur={handleCustomInputSubmit}
          onFocus={handleInputFocus}
          onKeyDown={handleCustomInputEnter}
          onChange={handleCustomInputChange}
        />
        To
        <Input
          ref={ref => (refs.current.to = ref)}
          name="custom-to"
          placeholder="yyyy-mm-dd"
          value={customDate.to ?? ''}
          onBlur={handleCustomInputSubmit}
          onFocus={handleInputFocus}
          onKeyDown={handleCustomInputEnter}
          onChange={handleCustomInputChange}
        />
      </Label>
      <Collapsible.Body {...getContentProps()}>
        <CalendarDatePicker
          ref={ref => (refs.current.calendar = ref)}
          value={date}
          activeStartDate={activeStartDate}
          onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
          onChange={handleDateChange}
        />
      </Collapsible.Body>
    </Container>
  );
};

const Container = styled.fieldset`
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
  gap: 2rem;

  ${Input} {
    height: 6rem;
    font-size: var(--font-size-xs);
    color: var(--color-blue-gray-45);

    &:focus {
      border-color: var(--color-blue-60);
    }

    &[data-status='custom'] {
      color: var(--color-blue-gray-70);
    }
  }
`;

const Option = styled.div`
  cursor: pointer;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  font-size: var(--font-size-s);
  color: var(--color-blue-gray-70);
  font-weight: 300;
  gap: 2rem;
`;

function handleInputFocus(event) {
  event.target.parentNode.click();
}
