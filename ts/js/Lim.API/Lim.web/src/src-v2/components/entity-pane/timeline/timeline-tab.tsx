import { format } from 'date-fns';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { TextButton } from '@src-v2/components/button-v2';
import { Card } from '@src-v2/components/cards';
import { Circle } from '@src-v2/components/circles';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import {
  TimelineEvent,
  TimelineEventType,
  TimelineFilterOption,
} from '@src-v2/components/entity-pane/timeline/timeline';
import { TimelineFilters } from '@src-v2/components/entity-pane/timeline/timeline-filters';
import { TimelineItemFactory } from '@src-v2/components/entity-pane/timeline/timeline-item-factory';
import {
  useElementTimelineEvent,
  useRiskTimelineEvents,
} from '@src-v2/components/entity-pane/timeline/use-timeline-events';
import { Caption1, Heading4, Paragraph } from '@src-v2/components/typography';
import { entries } from '@src-v2/utils/ts-utils';

export const TimelineTab = observer(() => {
  const { risk, element, relatedProfile } = useEntityPaneContext();
  const [filterBy, setFilterBy] = useState<keyof typeof TimelineEventType>();

  if (risk) {
    return (
      <RiskTimelineTab
        risk={risk}
        element={element}
        relatedProfile={relatedProfile}
        filterBy={filterBy}
        onFilterChange={setFilterBy}
        relatedEntityKey={relatedProfile?.key}
      />
    );
  }

  return (
    <ElementTimelineTab
      element={element}
      relatedProfile={relatedProfile}
      filterBy={filterBy}
      onFilterChange={setFilterBy}
      relatedEntityKey={relatedProfile?.key}
    />
  );
});

const RiskTimelineTab = ({
  risk,
  element,
  relatedProfile,
  filterBy,
  onFilterChange,
  relatedEntityKey,
}) => {
  const { filterOptions, filteredEventsGroups, allEvents } = useRiskTimelineEvents(
    risk,
    element,
    relatedProfile,
    filterBy
  );

  return (
    <BaseTimelineTab
      allEvents={allEvents}
      filteredEventsGroups={filteredEventsGroups}
      filterOptions={filterOptions}
      onFilterChange={onFilterChange}
      relatedEntityKey={relatedEntityKey}
    />
  );
};

const ElementTimelineTab = ({
  element,
  relatedProfile,
  filterBy,
  onFilterChange,
  relatedEntityKey,
}) => {
  const { allEvents, filteredEventsGroups } = useElementTimelineEvent(
    element,
    relatedProfile,
    filterBy
  );

  return (
    <BaseTimelineTab
      allEvents={allEvents}
      filteredEventsGroups={filteredEventsGroups}
      filterOptions={[]}
      onFilterChange={onFilterChange}
      relatedEntityKey={relatedEntityKey}
    />
  );
};

interface BaseTimelineTabProps {
  allEvents: TimelineEvent[];
  filteredEventsGroups: _.Dictionary<TimelineEvent[]>;
  filterOptions: TimelineFilterOption[];
  onFilterChange: () => void;
  relatedEntityKey: string;
}

const BaseTimelineTab = ({
  allEvents,
  filteredEventsGroups,
  filterOptions,
  onFilterChange,
  relatedEntityKey,
}: BaseTimelineTabProps) => {
  const trackAnalytics = useTrackAnalytics();

  useEffect(
    () =>
      trackAnalytics(AnalyticsEventName.ActionClicked, {
        [AnalyticsDataField.ActionType]: `Risk pane timeline`,
        [AnalyticsDataField.IsEmpty]: _.isEmpty(allEvents).toString(),
      }),
    [allEvents]
  );

  const filteredEventsGroupsByYear = _.orderBy(
    entries(_.groupBy(entries(filteredEventsGroups), ([date]) => format(date, 'Y'))),
    ([year]) => year,
    'desc'
  );

  const currentYear = format(new Date(), 'Y');

  return _.isEmpty(filteredEventsGroups) ? (
    <EmptyTimeline>No events yet...</EmptyTimeline>
  ) : (
    <TimelineContainer>
      <TimelineFilters options={filterOptions} onFilterChanged={onFilterChange} />
      {filteredEventsGroupsByYear.map(([eventsGroupYear, eventGroups], index) => (
        <Fragment key={index}>
          {eventsGroupYear !== currentYear && (
            <YearContainer>
              <StyledTimeYear>{eventsGroupYear}</StyledTimeYear>
            </YearContainer>
          )}
          {eventGroups.map(([_, events], index) => (
            <EventsGroup key={index} relatedEntityKey={relatedEntityKey} events={events} />
          ))}
        </Fragment>
      ))}
    </TimelineContainer>
  );
};

const EmptyTimeline = styled.div`
  margin-top: 40rem;
  font-size: var(--font-size-m);
  font-weight: 500;
  text-align: center;
`;

const TimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 6rem;
`;

const EventsGroup = ({
  relatedEntityKey,
  events,
}: {
  relatedEntityKey: string;
  events: TimelineEvent[];
}) => {
  const groupDate = events[0]?.createdAt;

  return (
    <>
      <GroupDate>
        <Heading4>{format(groupDate, 'dd')}</Heading4>
        <Paragraph>{format(groupDate, 'MMM')}</Paragraph>
      </GroupDate>

      {events.map((item, index) => (
        <CardContainer key={index}>
          <TimelineItemFactory relatedEntityKey={relatedEntityKey} item={item} />
        </CardContainer>
      ))}
    </>
  );
};

const GroupDate = styled.div`
  display: flex;
  width: 12rem;
  height: 15rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: 2rem;

  ${Paragraph} {
    font-size: var(--font-size-s);
  }
`;

const YearContainer = styled.div`
  height: 12rem;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    left: 8rem;
    height: 100%;
    width: 0.25rem;
    background-color: var(--color-blue-gray-30);
  }
`;

const StyledTimeYear = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--color-blue-gray-20);
  padding: 4px 12px;
  border-radius: 50px;
  width: 16rem;
  height: 7rem;
  z-index: 2;
  font-weight: 300;
  line-height: 20px;
`;

const CardContainer = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  padding-bottom: 6rem;
  gap: 2rem;
  margin-left: 2rem;

  &:before {
    content: '';
    position: absolute;
    left: 5.85rem;
    height: 100%;
    width: 0.25rem;
    background-color: var(--color-blue-gray-30);
  }

  > ${Circle} {
    margin: 3rem 2rem 0 2.5rem;
    padding: 1rem;
  }

  > ${Card} {
    flex-grow: 1;
    margin-bottom: 0;

    ${Heading4} {
      font-size: var(--font-size-m);
      font-weight: 600;
    }

    ${Circle} {
      align-self: center;
    }

    ${Paragraph} {
      font-size: var(--font-size-s);
    }

    ${Caption1} {
      font-size: var(--font-size-s);
      font-weight: 400;
    }

    ${TextButton} {
      font-size: var(--font-size-s);
      font-weight: 400;
    }

    ${Paragraph} {
      font-size: var(--font-size-s);
      font-weight: 400;
    }
  }
`;
