import { observer } from 'mobx-react';
import { forwardRef } from 'react';
import styled from 'styled-components';
import {
  ActionCircleMode,
  ActionTakenCircle,
} from '@src-v2/components/circles/action-taken-circle';
import { SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { TippyAttributes } from '@src-v2/components/tooltips/tippy';
import { Size } from '@src-v2/components/types/enums/size';
import {
  ActionsHistoryContent,
  ActionsHistoryPopover,
} from '@src-v2/containers/actions-timeline/actions-history-popover';
import { useGroupProperties } from '@src-v2/hooks';
import { useCombineCallbacks } from '@src-v2/hooks/use-combine-callbacks';
import { ActionsTakenSummary } from '@src-v2/types/risks/action-taken-details';
import { dataAttr, preventDefault, stopPropagation } from '@src-v2/utils/dom-utils';

export const ActionsHistory = observer(
  forwardRef<
    HTMLSpanElement,
    {
      summary: ActionsTakenSummary;
      itemToTimelineLink?: (location?: Location) => { pathname: string; query: {} };
    }
  >(({ summary, itemToTimelineLink, ...props }, ref) => {
    const [elementProps] = useGroupProperties(props, TippyAttributes);

    const circleMode =
      summary.isAutomated && summary.isManual
        ? ActionCircleMode.combined
        : summary.isAutomated
          ? ActionCircleMode.automated
          : ActionCircleMode.manual;

    let IconComponent, iconName;

    switch (summary.type) {
      case 'Issue':
        IconComponent = VendorIcon;
        iconName = summary.provider;

        break;
      case 'Comment':
        IconComponent = SvgIcon;
        iconName = summary.type;
        break;
      default:
        IconComponent = VendorIcon;
        iconName = summary.provider;
        break;
    }

    return (
      <ActionsHistoryPopover
        noArrow
        placement="top"
        content={
          <ActionsHistoryContent
            mode={circleMode}
            summary={summary}
            itemToTimelineLink={itemToTimelineLink}
          />
        }>
        <SummaryCircle
          {...elementProps}
          ref={ref}
          data-mode={circleMode}
          size={Size.MEDIUM}
          data-value={dataAttr(Boolean(summary.items.length), summary.items.length)}
          onClick={useCombineCallbacks(preventDefault, stopPropagation)}>
          <IconComponent name={iconName} />
        </SummaryCircle>
      </ActionsHistoryPopover>
    );
  })
);

const SummaryCircle = styled(ActionTakenCircle)`
  position: relative;
  cursor: pointer;

  &[data-value]:after {
    content: attr(data-value);
    position: absolute;
    bottom: -0.25rem;
    right: -0.25rem;
    padding: 0 0.75rem;
    color: var(--color-blue-gray-70);
    line-height: 3rem;
    font-size: 2.5rem;
    border-radius: 100vmax;
    background-color: var(--color-white);
    border: 0.125rem solid var(--color-blue-gray-70);
  }
`;
