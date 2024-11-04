import { Meta } from '@storybook/react';
import { CalendarDatePicker as CalendarDatePickerCmp } from '@src-v2/components/forms/calendar-date-picker';
import { CalendarDatePickerFilter as CalendarDatePickerFilterCmp } from '../src/src-v2/components/filters/inline-control/components/calendar-date-picker-filter-control';

const date = new Date();
const minDate = new Date(date.setMonth(date.getMonth() - 5));
const maxDate = new Date(date.setMonth(date.getMonth() + 5));
export default {
  title: 'Components/Date Picker',
  argTypes: {},
} as Meta;

const CalendarDatePickerTemplate = args => <CalendarDatePickerCmp {...args} />;
export const DatePicker = CalendarDatePickerTemplate.bind({});
DatePicker.args = {
  value: date,
  selectRange: false,
  minDate,
  maxDate,
  onChange: date => alert(date.toLocaleString()),
};

const CalendarDatePickerFilterTemplate = args => <CalendarDatePickerFilterCmp {...args} />;
export const DatePickerFilter = CalendarDatePickerFilterTemplate.bind({});
DatePickerFilter.args = {
  date: new Date(),
  minDate,
};
