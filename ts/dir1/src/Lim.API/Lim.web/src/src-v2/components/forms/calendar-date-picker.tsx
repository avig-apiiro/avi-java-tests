import { forwardRef, useCallback } from 'react';
import Calendar from 'react-calendar';
import styled from 'styled-components';
import { SvgIcon } from '@src-v2/components/icons';

type CalendarDateValueType = Date | Date[];

interface CalendarDatePickerProps {
  value?: CalendarDateValueType;
  selectRange?: boolean;
  maxDate?: Date;
  minDate?: Date;
  onChange?: (date: CalendarDateValueType) => void;
  activeStartDate?: Date;
  onActiveStartDateChange?: ({ activeStartDate }: { activeStartDate: Date }) => void;
}

export const CalendarDatePicker = forwardRef<
  HTMLDivElement | HTMLAnchorElement,
  CalendarDatePickerProps
>(({ selectRange = true, maxDate, minDate, onChange, ...props }, ref) => {
  const formatDay = useCallback(
    (locale, date) => date.toLocaleDateString(locale, { weekday: 'narrow' }),
    []
  );

  return (
    <CalendarContainer
      inputRef={ref}
      tileClassName="custom-tile"
      minDetail="decade"
      next2Label={null}
      prev2Label={null}
      prevLabel={<SvgIcon name="Chevron" />}
      nextLabel={<SvgIcon name="Chevron" />}
      formatShortWeekday={formatDay}
      maxDate={maxDate}
      minDate={minDate}
      onChange={onChange}
      {...props}
      selectRange={selectRange}
      allowPartialRange
    />
  );
});

export const CalendarContainer = styled(Calendar)`
  width: 78rem;
  padding: 3rem;
  text-align: center;
  line-height: 7rem;
  font-size: var(--font-size-s);
  color: var(--color-blue-gray-70);
  border: 0.25rem solid var(--default-shadow-color);
  border-radius: 3rem;

  .react-calendar__navigation {
    display: flex;
    justify-content: space-between;
    padding: 0 2.5rem;
    font-size: var(--font-size-m);
    font-weight: 500;

    .react-calendar__navigation__label {
      color: var(--color-blue-gray-70);
    }

    .react-calendar__navigation__arrow {
      color: var(--color-blue-gray-40);

      &:first-of-type {
        transform: scaleX(-1);
      }

      &:hover {
        color: var(--color-blue-gray-50);
      }
    }
  }

  .react-calendar__month-view__weekdays__weekday {
    color: var(--color-blue-gray-55);
    padding: 1rem;
  }

  .custom-tile {
    height: 10rem;
    padding: 1rem;
    line-height: 8rem;
    border-radius: 100vmax;
    gap: 4rem;

    > abbr {
      display: block;
    }

    &:hover {
      background-color: var(--color-blue-gray-20);
    }

    &.custom-tile:disabled abbr {
      color: var(--color-blue-gray-40);
    }

    // current day/month/year
    &.react-calendar__tile--now {
      line-height: 7.5rem;

      > abbr {
        border: 0.25rem solid var(--color-blue-gray-70);
        border-radius: 100vmax;
      }

      &.react-calendar__year-view__months__month > abbr {
        border-radius: 2rem;
      }

      &.react-calendar__decade-view__years__year {
        border: 0.25rem solid var(--color-blue-gray-70);
      }
    }

    &.react-calendar__month-view__days__day--neighboringMonth {
      color: var(--color-blue-gray-40);
    }

    // selected tiles on range selection
    &.react-calendar__tile--range {
      color: var(--color-blue-gray-70);
      background-color: var(--color-blue-35);
      border: none;
      border-radius: 0;
    }

    &.react-calendar__tile--rangeEnd {
      color: var(--color-white);
      border-radius: 0 100vmax 100vmax 0;

      > abbr {
        border-radius: 100vmax;
        background-color: var(--color-blue-60);
      }
    }

    &.react-calendar__tile--rangeStart {
      color: var(--color-white);
      border-radius: 100vmax 0 0 100vmax;

      > abbr {
        border-radius: 100vmax;
        background-color: var(--color-blue-60);
      }
    }

    &.react-calendar__tile--rangeBothEnds {
      border-radius: 100vmax;
    }

    // hovered tiles on range selection
    &.react-calendar__tile--hover {
      border-radius: 0;
      background-color: var(--color-blue-gray-20);

      &.react-calendar__tile--hoverEnd {
        border-radius: 0 100vmax 100vmax 0;
      }

      &.react-calendar__tile--hoverStart {
        border-radius: 100vmax 0 0 100vmax;
      }

      &.react-calendar__tile--hoverBothEnds {
        border-radius: 100vmax;
      }
    }

    // month picker styling
    &.react-calendar__year-view__months__month {
      border-radius: 2rem;
      background-color: unset;

      > abbr {
        color: var(--color-blue-gray-70);
        border-radius: 2rem;
        background-color: unset;

        &:hover {
          color: var(--color-white);
          background-color: var(--color-blue-60);
        }
      }
    }

    // year picker styling
    &.react-calendar__decade-view__years__year {
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--color-blue-gray-70);
      background-color: unset;
      border: 0.5rem solid var(--color-white);
      border-radius: 2rem;

      &:hover {
        color: var(--color-white);
        background-color: var(--color-blue-60);
      }
    }
  }
`;
