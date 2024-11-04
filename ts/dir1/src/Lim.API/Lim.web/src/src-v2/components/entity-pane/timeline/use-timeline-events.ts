import { format } from 'date-fns';
import _ from 'lodash';
import { useMemo } from 'react';
import {
  RiskOverrideEvent,
  TimelineEvent,
  TimelineEventType,
  TimelineFilterOption,
} from '@src-v2/components/entity-pane/timeline/timeline';
import { useInject, useSuspense } from '@src-v2/hooks';
import {
  CommentTimelineEvent,
  DueDateChangeTimelineEvent,
  EntityEvent,
} from '@src-v2/types/inventory-elements';
import { BaseElement } from '@src-v2/types/inventory-elements/base-element';
import { LeanConsumableProfile } from '@src-v2/types/profiles/lean-consumable-profile';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';

const defaultEntityProfileEvents = () => Promise.resolve([]);

export function useRiskTimelineEvents(
  risk: RiskTriggerSummaryResponse,
  element: BaseElement,
  relatedEntity: LeanConsumableProfile,
  filterBy?: keyof typeof TimelineEventType
) {
  const { inventory, risks } = useInject();

  const entityEvents = useSuspense(
    element && relatedEntity ? inventory.getEntityProfileEvents : defaultEntityProfileEvents,
    {
      repositoryKey: relatedEntity?.key,
      entityKey: element?.entityId,
      entityType: element?.entityType,
    }
  );

  const [dueDateEvents, commentEvents, overrideRiskLevelEvents, overrideRiskStatusEvents] =
    useSuspense([
      [risks.getDueDateEvents, { key: risk.key }] as const,
      [risks.getCommentEvents, { key: risk.key }] as const,
      [risks.getOverrideRiskLevelEvents, { key: risk.key }] as const,
      [risks.getOverrideRiskStatusEvents, { key: risk.key }] as const,
    ]);

  const { filterOptions, allEvents } = useMemo(() => {
    const allEvents = aggregateTimelineEvents(
      risk,
      dueDateEvents,
      commentEvents,
      entityEvents,
      overrideRiskLevelEvents,
      overrideRiskStatusEvents
    );
    const filterOptions = buildFilterOptions(allEvents);

    return { filterOptions, allEvents };
  }, [
    risk?.riskOverrideData?.riskLevel,
    risk?.actionsTakenSummaries,
    entityEvents,
    overrideRiskLevelEvents,
    overrideRiskStatusEvents,
  ]);

  const filteredEventsGroups = useMemo(() => {
    const filteredEvents = filterBy ? allEvents.filter(item => item.type === filterBy) : allEvents;
    return _.groupBy(filteredEvents, event => format(event.createdAt, 'P'));
  }, [allEvents, filterBy]);

  return {
    filteredEventsGroups,
    filterOptions,
    allEvents,
  };
}

export function useElementTimelineEvent(
  element: BaseElement,
  relatedProfile: LeanConsumableProfile,
  filterBy?: keyof typeof TimelineEventType
) {
  const { inventory } = useInject();

  const allEvents = useSuspense(
    element && relatedProfile ? inventory.getEntityProfileEvents : defaultEntityProfileEvents,
    {
      repositoryKey: relatedProfile?.key,
      entityKey: element?.entityId,
      entityType: element?.entityType,
    }
  );

  const orderedAllEvents = useMemo(() => {
    const tempAllEvents = allEvents.filter(Boolean).map<TimelineEvent>(event => ({
      ...event,
      createdAt: new Date(event.createdAt),
      type: TimelineEventType.Commit,
    }));

    return _.orderBy(tempAllEvents, event => event.createdAt, 'desc');
  }, [allEvents]);

  const filteredEventsGroups = useMemo(() => {
    const filteredEvents = filterBy
      ? orderedAllEvents.filter(item => item.type === filterBy)
      : orderedAllEvents;
    return _.groupBy(filteredEvents, event => format(event.createdAt, 'P'));
  }, [orderedAllEvents, filterBy]);

  return { allEvents: orderedAllEvents, filteredEventsGroups };
}

function aggregateTimelineEvents(
  risk: RiskTriggerSummaryResponse,
  dueDateEvents: DueDateChangeTimelineEvent[],
  commentEvents: CommentTimelineEvent[],
  entityEvents: EntityEvent[],
  overrideRiskLevelEvents: any[],
  overrideRiskStatusEvents: any[]
): TimelineEvent[] {
  const unorderedEvents: TimelineEvent[] = entityEvents
    .map<TimelineEvent>(event => ({ ...event, type: TimelineEventType.Commit }))
    .concat(risk?.actionsTakenSummaries.flatMap<TimelineEvent>(({ items }) => items))
    .filter(Boolean);

  if (dueDateEvents) {
    unorderedEvents.push(...dueDateEvents);
  }

  if (commentEvents) {
    unorderedEvents.push(...commentEvents);
  }
  if (overrideRiskLevelEvents) {
    overrideRiskLevelEvents.forEach(data => unorderedEvents.push(new RiskOverrideEvent(data)));
  }
  if (overrideRiskStatusEvents) {
    overrideRiskStatusEvents.forEach(data => unorderedEvents.push(new RiskOverrideEvent(data)));
  }

  // @ts-expect-error
  const unorderedFinalEvents: TimelineEvent[] = unorderedEvents.map(event => ({
    ...event,
    type: event.type,
    createdAt: new Date(event.createdAt),
  }));
  return _.orderBy(unorderedFinalEvents, event => event.createdAt, 'desc');
}

function buildFilterOptions(orderedEvents: TimelineEvent[]): TimelineFilterOption[] {
  const typesCounter = orderedEvents.reduce(
    (result, event) => ({
      ...result,
      [event.type]: result[event.type] + 1,
    }),
    {
      [TimelineEventType.Commit]: 0,
      [TimelineEventType.Comment]: 0,
      [TimelineEventType.DueDateChange]: 0,
      [TimelineEventType.Issue]: 0,
      [TimelineEventType.Message]: 0,
      [TimelineEventType.RiskOverrideEvent]: 0,
    }
  );

  return Object.entries(typesCounter)
    .filter(([, count]) => Boolean(count))
    .reduce((result, [key, count]) => [...result, { type: key, count }], []);
}
