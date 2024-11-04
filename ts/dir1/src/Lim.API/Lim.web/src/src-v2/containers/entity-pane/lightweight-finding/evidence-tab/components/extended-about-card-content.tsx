import _ from 'lodash';
import styled from 'styled-components';
import { Badge } from '@src-v2/components/badges';
import { ClampText } from '@src-v2/components/clamp-text';
import { Divider } from '@src-v2/components/divider';
import {
  EvidenceLine,
  EvidenceLinesWrapper,
} from '@src-v2/components/entity-pane/evidence/evidence-line';
import { HtmlMarkdown } from '@src-v2/components/html-markdown';
import { RiskTag } from '@src-v2/components/tags';
import { DateTime } from '@src-v2/components/time';
import { Size } from '@src-v2/components/types/enums/size';
import { ExternalLink, Heading5 } from '@src-v2/components/typography';
import { dateFormats } from '@src-v2/data/datetime';
import { getProviderDisplayName } from '@src-v2/data/providers';
import { LightweightFindingResponse } from '@src-v2/types/inventory-elements/lightweight-finding-response';
import { humanize } from '@src-v2/utils/string-utils';

export const ExtendedAboutCardContent = ({ finding }: { finding: LightweightFindingResponse }) => {
  const {
    finding: {
      sourceRawFindings,
      findingPrograms,
      updatedTime,
      createdOnTime,
      foreignFindingStatus,
      actors,
    },
  } = finding;

  return (
    <ExtendedAboutCardContentWrapper>
      {sourceRawFindings?.map((sourceRawFinding, index) => (
        <>
          <Divider />
          <AdditionalInfoHeader>
            <Heading5>
              Additional information from {getProviderDisplayName(sourceRawFinding.provider)}
            </Heading5>
            {sourceRawFinding.url && (
              <ExternalLink href={sourceRawFinding.url}>
                View in {getProviderDisplayName(sourceRawFinding.provider)}
              </ExternalLink>
            )}
          </AdditionalInfoHeader>
          <EvidenceLinesWrapper>
            {findingPrograms?.length > 0 && (
              <EvidenceLine isExtendedWidth label="Program name">
                {findingPrograms.map(findingProgram => findingProgram.name).join(', ')}
              </EvidenceLine>
            )}
            {sourceRawFinding.findingId && (
              <EvidenceLine isExtendedWidth label="Finding identifier">
                {sourceRawFinding.findingId}
              </EvidenceLine>
            )}
            {updatedTime && (
              <EvidenceLine isExtendedWidth label="Updated on">
                <DateTime date={updatedTime} format={dateFormats.longDate} />
              </EvidenceLine>
            )}
            {createdOnTime && (
              <EvidenceLine isExtendedWidth label="Created on">
                <DateTime date={createdOnTime} format={dateFormats.longDate} />
              </EvidenceLine>
            )}
            {foreignFindingStatus && (
              <EvidenceLine isExtendedWidth label="Status">
                {foreignFindingStatus}
              </EvidenceLine>
            )}
            {sourceRawFinding.rawFields
              ?.filter(({ value }) => value)
              .map(({ key, value }) => (
                <EvidenceLine key={key} isExtendedWidth label={humanize(key)}>
                  <ConvertRawField id={key} value={value} />
                </EvidenceLine>
              ))}
            {Boolean(actors?.length) &&
              actors.map(actor => {
                return (
                  <>
                    {actor.name && (
                      <EvidenceLine isExtendedWidth label={humanize(actor.type)}>
                        {actor.name} {actor.email && `(${actor.email})`}
                      </EvidenceLine>
                    )}
                    {actor.isStaff !== null && (
                      <EvidenceLine isExtendedWidth label={humanize(`${actor.type} is staff`)}>
                        {String(actor.isStaff)}
                      </EvidenceLine>
                    )}
                  </>
                );
              })}
            {Boolean(sourceRawFinding.tags?.length) && (
              <EvidenceLine isExtendedWidth label="Tags">
                {sourceRawFinding.tags.map(({ key, value }) => (
                  <BadgeWrapper size={Size.XSMALL}>
                    <TagKey>{key}:</TagKey> <ClampText>{value}</ClampText>
                  </BadgeWrapper>
                ))}
              </EvidenceLine>
            )}
          </EvidenceLinesWrapper>
          {index < sourceRawFindings?.length - 1 && <Divider />}
        </>
      ))}
    </ExtendedAboutCardContentWrapper>
  );
};

const TagKey = styled.span``;

const BadgeWrapper = styled(Badge)`
  display: flex;
  max-width: 60rem;

  ${TagKey} {
    flex-shrink: 0;
  }
`;

const ConvertRawField = ({ id, value }: { id: string; value: string }) => {
  switch (id) {
    case 'VulnerabilityReferences':
      return <HtmlMarkdown>{value}</HtmlMarkdown>;
    case 'Severity':
      return <RiskTag riskLevel={value.toLowerCase()}>{_.capitalize(value)}</RiskTag>;
    case 'First detected':
    case 'Introduced on':
    case 'Triaged On':
      return <DateTime date={value} format={dateFormats.longDate} />;
    default:
      return <>{value}</>;
  }
};

const ExtendedAboutCardContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
  margin-top: 4rem;

  span {
    width: fit-content;
    margin-right: 1rem;
  }
`;

const AdditionalInfoHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;
