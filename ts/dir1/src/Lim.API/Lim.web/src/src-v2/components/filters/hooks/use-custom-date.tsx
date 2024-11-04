import { format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { useToggle } from '@src-v2/hooks';
import { isValidDate } from '@src-v2/utils/datetime-utils';

function formatDateToPattern(date) {
  return date ? format(date, 'yyyy-MM-dd') : null;
}

function normalizeValue(from, to) {
  if (isValidDate(from) && isValidDate(to)) {
    return sortDates(from, to);
  }
  if (isValidDate(from)) {
    return new Date(from);
  }
  if (isValidDate(to)) {
    return new Date(to);
  }
  return null;
}

function sortDates(from, to) {
  const dates = [new Date(from), new Date(to)].sort(
    (last, current) => last.getTime() - current.getTime()
  );
  // make slight change to validate dates are not equal
  dates[1].setHours(23, 59, 59, 999);
  return dates;
}

export const useCustomDate = ({ date, refs, handleChange }) => {
  const [isCustom, toggleCustom] = useToggle(Boolean(date?.length));
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [customDate, setCustomDate] = useState({
    from: formatDateToPattern(date?.[0]),
    to: formatDateToPattern(date?.[1]),
  });

  useEffect(() => {
    if (date?.length === 1) {
      handleChange(null);
      setCustomDate({ from: null, to: null });
    }
  }, []);

  const setDateValue = useCallback(
    value => {
      if (Array.isArray(value) && value.length === 2) {
        setActiveStartDate(value[0]);
        handleChange(value);
      } else {
        handleChange(null);
      }
    },
    [handleChange, setActiveStartDate]
  );

  const handleDateChange = useCallback(
    dates => {
      setCustomDate({
        from: formatDateToPattern(dates?.[0]),
        to: formatDateToPattern(dates?.[1]),
      });
      setDateValue(dates);
    },
    [setCustomDate, setDateValue]
  );

  const handleCustomInputSubmit = useCallback(
    event => {
      if (
        isValidDate(event.target.value) &&
        (customDate.from === null) !== (customDate.to === null)
      ) {
        setActiveStartDate(new Date(event.target.value));
      }
      const value = normalizeValue(
        event.target.value,
        customDate[event.target.name === 'custom-from' ? 'to' : 'from']
      );
      setDateValue(value);
      // uses an internal API to update library's internal state with new value
      refs.current.calendar?.setStateAndCallCallbacks({ value });
    },
    [customDate, setDateValue, setActiveStartDate]
  );

  const handleCustomInputEnter = useCallback(
    event => {
      event.key === 'Enter' && handleCustomInputSubmit(event);
    },
    [handleCustomInputSubmit]
  );

  const handleCustomInputChange = useCallback(
    event =>
      setCustomDate(customDate => ({
        ...customDate,
        [event.target.name === 'custom-from' ? 'from' : 'to']: event.target.value,
      })),
    [setCustomDate]
  );

  const handleRadioChange = event => {
    if (event.target.type !== 'radio') {
      return;
    }
    switch (event.target.value) {
      case '-1':
        toggleCustom(false);
        handleChange(null);
        break;

      case 'custom-days':
        if (refs.current.from?.value !== '' && refs.current.to?.value === '') {
          refs.current.to?.focus();
        } else {
          refs.current.from?.focus();
          refs.current.from?.select();
        }

        const value = normalizeValue(customDate.from, customDate.to);
        toggleCustom(true);
        setDateValue(value);
        break;

      default:
        const date = new Date();
        const lastDays = new Date(date.getTime());
        lastDays.setDate(lastDays.getDate() - Number(event.target.value));

        // taking care of closing calendar box animation
        setTimeout(() => handleChange([lastDays, date]), 200);
        toggleCustom(false);
    }
  };

  return {
    isCustom,
    customDate,
    activeStartDate,
    setActiveStartDate,
    handleDateChange,
    handleRadioChange,
    handleCustomInputEnter,
    handleCustomInputChange,
    handleCustomInputSubmit,
  };
};
