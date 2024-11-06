import { observer } from 'mobx-react';
import { useCallback } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { TextButton } from '@src-v2/components/button-v2';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { CalendarDatePicker } from '@src-v2/components/forms/calendar-date-picker';
import { DateTime } from '@src-v2/components/time';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Link } from '@src-v2/components/typography';
import { dateFormats } from '@src-v2/data/datetime';
import { useInject } from '@src-v2/hooks';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';
import { stopPropagation } from '@src-v2/utils/dom-utils';
import { modify } from '@src-v2/utils/mobx-utils';

export const RiskDueDate = observer(({ risk }: { risk: RiskTriggerSummaryResponse }) => {
  const { toaster, risks } = useInject();
  const trackAnalytics = useTrackAnalytics();

  const handleDueDateChange = useCallback(
    async (newDate: Date) => {
      try {
        await risks.changeRiskDueDate({ newDate, triggerKeys: [risk.key] });
        modify(risk, { dueDate: newDate, slaPolicyMetadata: null });
        toaster.success('Risk due-date changed successfully');
        trackAnalytics(AnalyticsEventName.ActionClicked, {
          [AnalyticsDataField.ActionType]: 'Override due date',
        });
      } catch (error) {
        toaster.error(error.response.data);
      }
    },
    [risk, toaster]
  );

  return (
    <Container>
      <Tooltip
        interactive
        content={
          risk.dueDate ? (
            'Override due date'
          ) : (
            <>
              Override due date or <Link to="settings/general">set SLA</Link>
            </>
          )
        }>
        <DropdownMenu
          plugins={[hideCalendarOnClickCustomPlugin]}
          onClick={stopPropagation}
          onItemClick={stopPropagation}
          size={Size.MEDIUM}
          maxHeight="100%"
          icon="Calendar">
          <CalendarPicker
            minDate={new Date(risk.discoveredAt)}
            selectRange={false}
            onChange={handleDueDateChange}
            maxDate={null}
          />
        </DropdownMenu>
      </Tooltip>
      {risk.dueDate ? (
        <>
          <DateTime date={risk.dueDate} format={dateFormats.longDate} />
          <InfoTooltip
            interactive
            content={
              <>
                {risk.slaPolicyMetadata?.key ? (
                  <>
                    This due date is controlled by SLA policy
                    <br />
                    <TextButton to="/settings/general">
                      {risk.slaPolicyMetadata.key === 'GlobalSlaKey'
                        ? risk.slaPolicyMetadata.name.replace('Sla', 'SLA')
                        : risk.slaPolicyMetadata.name}
                    </TextButton>
                  </>
                ) : (
                  <>Due date set manually</>
                )}
              </>
            }
          />
        </>
      ) : (
        'Not set'
      )}
    </Container>
  );
});

const Container = styled.div`
  display: flex;
  height: 5rem;
  gap: 1rem;
  align-items: center;

  ${DropdownMenu} {
    overflow: visible;
    box-shadow: var(--elevation-1);

    &:hover {
      box-shadow: var(--elevation-2);
    }
  }
`;

const CalendarPicker = styled(CalendarDatePicker)`
  border: 0;

  &[disabled] {
    opacity: 0.5;
  }
`;

export const hideCalendarOnClickCustomPlugin = {
  name: 'hideCalendarOnChange',
  defaultValue: true,
  fn: instance => ({
    onCreate() {
      instance.popper.addEventListener('click', event => {
        if (event.target.closest('[class*="months"]') || event.target.closest('[class*="years"]')) {
          return;
        }
        const closestItem = event.target.closest('.react-calendar__tile');
        if (closestItem && !event.defaultPrevented && instance.popper.contains(closestItem)) {
          setTimeout(() => instance.state.isMounted && instance.hide());
        }
      });
    },
  }),
};
