import { endOfDay, format, startOfDay } from 'date-fns';
import { useCallback, useState } from 'react';
import styled from 'styled-components';
import { Input, Radio } from '@src-v2/components/forms';
import { CalendarDatePicker } from '@src-v2/components/forms/calendar-date-picker';
import { isValidDate, sortDates } from '@src-v2/utils/datetime-utils';
import { dataAttr } from '@src-v2/utils/dom-utils';

export const DATE_CONSTANTS = {
  ALL_DATES: '-1',
  CUSTOM: 'custom',
  RANGE: 2,
};
type preset = 'past' | 'future';

const DatesPreset = ({ value, label, selectedValue, onChange }) => (
  <Label data-checked={dataAttr(selectedValue === value)}>
    <Radio value={value} checked={selectedValue === value} onChange={onChange} />
    {label}
  </Label>
);

export const CalendarDatePickerFilter = ({
  dates,
  options = ['7', '14', '30', '90'],
  onChange,
  filter,
  presetsType = 'past',
  ...props
}: {
  dates: Date[];
  options?: string[];
  onChange: ({ value, preset }, event: Event) => void;
  filter: any;
  presetsType: preset;
}) => {
  const {
    activeStartDate,
    selectedPresetValue,
    setActiveStartDate,
    handleDatePickerChange,
    handleRadioChange,
  } = useCustomDate({ dates, onChange, filter, presetsType });

  return (
    <Container {...props}>
      <CalendarPicker
        /*@ts-expect-error*/
        key={dates}
        value={dates}
        activeStartDate={activeStartDate}
        onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
        onChange={handleDatePickerChange}
      />
      <Presets>
        {!filter?.defaultValue && (
          <DatesPreset
            label="All Dates"
            value={DATE_CONSTANTS.ALL_DATES}
            selectedValue={selectedPresetValue}
            onChange={handleRadioChange}
          />
        )}
        {options.map((option, index) => (
          <DatesPreset
            label={`${presetsType === 'future' ? 'Next' : 'Last'} ${option} days`}
            key={index}
            value={option}
            selectedValue={selectedPresetValue}
            onChange={handleRadioChange}
          />
        ))}
        <DatesPreset
          label="Custom"
          value={DATE_CONSTANTS.CUSTOM}
          selectedValue={selectedPresetValue}
          onChange={handleRadioChange}
        />
      </Presets>
    </Container>
  );
};

function formatDateToPattern(date) {
  return date ? format(date, 'yyyy-MM-dd') : null;
}

function normalizeValue(from, to) {
  const isFromValid = isValidDate(from);
  const isToValid = isValidDate(to);

  if (isFromValid) {
    return isToValid ? sortDates(from, to) : new Date(from);
  }

  return isToValid ? new Date(to) : null;
}

function useCustomDate({ dates, onChange, filter, presetsType }) {
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [selectedPresetValue, setSelectedPresetValue] = useState(
    filter?.preset || DATE_CONSTANTS.ALL_DATES
  );

  const [customDate, setCustomDate] = useState({
    from: formatDateToPattern(dates?.[0]),
    to: formatDateToPattern(dates?.[1]),
  });

  const setDateValue = useCallback(
    (value, preset) => {
      const isDateRange = Array.isArray(value) && value.length === DATE_CONSTANTS.RANGE;

      if (isDateRange) {
        value = value.sort((a, b) => a - b);
        setActiveStartDate(value[0]);
        setSelectedPresetValue(preset);
        onChange({ value, preset });
      } else if (value === null) {
        setActiveStartDate(null);
        setSelectedPresetValue(preset);
        onChange({ value: null });
      }
    },
    [onChange]
  );

  const handleDatePickerChange = useCallback(
    dates => {
      setCustomDate({
        from: formatDateToPattern(dates?.[0]),
        to: formatDateToPattern(dates?.[1]),
      });
      setDateValue(dates, DATE_CONSTANTS.CUSTOM);
    },
    [setCustomDate, setDateValue, selectedPresetValue]
  );

  const handleRadioChange = event => {
    setSelectedPresetValue(event.target.value);

    switch (event.target.value) {
      case DATE_CONSTANTS.ALL_DATES:
        setDateValue(null, event.target?.value);
        break;
      case DATE_CONSTANTS.CUSTOM:
        const value = normalizeValue(customDate.from, customDate.to);
        setDateValue(value, event.target.value);
        break;
      default:
        const days = Number(event.target?.value);
        if (isNaN(days)) {
          return;
        }

        const currentDate = new Date();
        const targetDate = new Date(currentDate);
        targetDate.setDate(currentDate.getDate() + days * (presetsType === 'future' ? 1 : -1));

        const [from, to] = [currentDate, targetDate].sort((a, b) => a.getTime() - b.getTime());
        setDateValue([startOfDay(to), endOfDay(from)], event.target.value);
    }
  };

  return {
    activeStartDate,
    setActiveStartDate,
    selectedPresetValue,
    handleDatePickerChange,
    handleRadioChange,
  };
}

const Container = styled.fieldset`
  display: flex;
  margin-top: 2rem;
  gap: 2rem;

  ${Input} {
    height: 6rem;
    font-size: var(--font-size-xs);

    &:focus {
      border-color: var(--color-blue-60);
    }
  }
`;

const Label = styled.label`
  cursor: pointer;
  padding: 3rem;

  &[data-checked] {
    color: var(--color-white);
    border-radius: 2rem;
    background-color: var(--color-blue-60);
  }

  ${Radio} {
    display: none;
  }
`;

const Presets = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin-left: 2rem;
  gap: 1rem;
`;

export const CalendarPicker = styled(CalendarDatePicker)`
  flex-shrink: 0;
  text-align: center;
  line-height: 7rem;
  font-size: var(--font-size-s);
  color: var(--color-blue-gray-70);
  padding: 0 3rem 3rem 3rem;
  border: 0;
  border-radius: inherit;

  .react-calendar__navigation {
    padding: 3rem;
  }
`;
