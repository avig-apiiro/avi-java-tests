import styled from 'styled-components';
import { Badge } from '@src-v2/components/badges';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { ClampText } from '@src-v2/components/clamp-text';
import {
  EvidenceLine,
  EvidenceLinesWrapper,
} from '@src-v2/components/entity-pane/evidence/evidence-line';
import { VendorIcon } from '@src-v2/components/icons';
import { DateTime } from '@src-v2/components/time';
import { Size } from '@src-v2/components/types/enums/size';
import { ExternalLink } from '@src-v2/components/typography';
import { ExpandableDescription } from '@src-v2/containers/entity-pane/sast/expandable-description';
import { useUserStoryPaneContext } from '@src-v2/containers/entity-pane/user-story/use-user-story-pane-context';
import { dateFormats } from '@src-v2/data/datetime';
import { stringifyIssueId } from '@src-v2/data/ticketing-issues-provider';

export function AboutUserStoryTicketCard(props: ControlledCardProps) {
  const { element, relatedProfile } = useUserStoryPaneContext();

  return (
    <ControlledCard {...props} title="About this ticket">
      <EvidenceLinesWrapper>
        <EvidenceLine isExtendedWidth label="Ticket ID">
          <VendorIcon name={relatedProfile.provider} />
          <ExternalLink href={element.externalUrl}>{stringifyIssueId(element.id)}</ExternalLink>
        </EvidenceLine>
        <EvidenceLine isExtendedWidth label="Type">
          {element.type}
        </EvidenceLine>
        <EvidenceLine isExtendedWidth label="Created on">
          <DateTime date={element.creationTime} format={dateFormats.longDate} />
        </EvidenceLine>
        <EvidenceLine isExtendedWidth label="Title">
          {element.title}
        </EvidenceLine>
        <EvidenceLine isExtendedWidth label="Description">
          <ExpandableDescription maxPreviewChars={250}>{element.description}</ExpandableDescription>
        </EvidenceLine>
        {Boolean(element?.labels?.length) && (
          <EvidenceLine isExtendedWidth label="Labels">
            <LabelsWrapper>
              {element.labels.map(label => (
                <Badge key={label} size={Size.XSMALL}>
                  <ClampText>{label}</ClampText>
                </Badge>
              ))}
            </LabelsWrapper>
          </EvidenceLine>
        )}
        {/*<EvidenceLine isExtendedWidth label="Assignee" />*/}
        {/*<EvidenceLine isExtendedWidth label="Reporter" />*/}
        {/*<EvidenceLine isExtendedWidth label="Parent ID" />*/}
      </EvidenceLinesWrapper>
    </ControlledCard>
  );
}

const LabelsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  overflow: hidden;

  ${Badge} {
    max-width: 70rem;
    font-size: var(--font-size-s);
  }
`;
