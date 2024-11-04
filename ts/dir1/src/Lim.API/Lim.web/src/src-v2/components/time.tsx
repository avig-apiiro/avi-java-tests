import { ReactElement, forwardRef } from 'react';
import styled from 'styled-components';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { useDistanceDate, useFormatDate, useRelativeDate } from '@src-v2/hooks/use-date-fns';
import { StyledProps } from '@src-v2/types/styled';

export const Time = styled.time``;

export type OptionalDate = Date | number | string;

export const DateTime = forwardRef<
  HTMLTimeElement,
  Omit<StyledProps<{ date?: OptionalDate; format?: string; suffix?: string }>, 'children'>
>(({ date = new Date(), format = 'PPPp', suffix = '', ...props }, ref) => (
  <Time ref={ref} {...props}>
    {useFormatDate(date, format)}
    {suffix}
  </Time>
));

export const DistanceTime = forwardRef<
  HTMLTimeElement,
  {
    date: OptionalDate;
    baseDate?: OptionalDate;
    strict?: boolean;
    addSuffix?: boolean;
    includeSeconds?: boolean;
    roundingMethod?: any;
    unit?: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';
  }
>(({ date, baseDate, strict, addSuffix, includeSeconds, roundingMethod, unit, ...props }, ref) => (
  <Time ref={ref} {...props}>
    {useDistanceDate(date, baseDate, { strict, addSuffix, includeSeconds, roundingMethod, unit })}
  </Time>
));

export const RelativeTime = forwardRef<
  HTMLTimeElement,
  { date: OptionalDate; baseDate: OptionalDate }
>(({ date = new Date(), baseDate, ...props }, ref) => (
  <Time ref={ref} {...props}>
    {useRelativeDate(date, baseDate)}
  </Time>
));

export const TimeTooltip = ({
  date = new Date(),
  format = 'PPPPp',
  ...props
}: {
  key?: string;
  date: OptionalDate;
  format?: string;
  children: ReactElement;
}) => <Tooltip {...props} content={useFormatDate(date, format)} />;
