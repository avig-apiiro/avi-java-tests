import { useCallback } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { Card } from '@src-v2/components/cards';
import { BaseIcon, SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { OverviewStateBoundary } from '@src-v2/components/overview/overview-state-boundary';
import { OverviewTile } from '@src-v2/components/overview/overview-tiles';
import { useOverviewFilters } from '@src-v2/components/overview/use-overview-filters';
import { InsightTag } from '@src-v2/components/tags';
import { DateTime } from '@src-v2/components/time';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import {
  EllipsisText,
  Heading4,
  Heading5,
  ListItem,
  UnorderedList,
} from '@src-v2/components/typography';
import { useMakeOverviewUrl } from '@src-v2/containers/overview/tiles/utils';
import { dateFormats } from '@src-v2/data/datetime';
import { useInject, useSuspense } from '@src-v2/hooks';
import { PatternedSecretsResult } from '@src-v2/types/overview/secrets-overview-responses';

export function SecretCommonExternalProviderKeysTile() {
  return (
    <OverviewTile title="Top exposed keys by external provider">
      <MostPatternedKeysTile />
    </OverviewTile>
  );
}

function MostPatternedKeysTile() {
  const trackAnalytics = useTrackAnalytics();
  const { activeFilters } = useOverviewFilters();
  const data = useSuspense(useInject().secretsOverview.getPatternedSecrets, {
    filters: activeFilters,
  });
  const isEmpty = data.length === 0 || data.every(item => !item.count);
  const handleRowClick = useCallback(() => {
    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.ActionType]: 'Tile click',
    });
  }, [trackAnalytics]);

  return (
    <OverviewStateBoundary isRisksTile isEmpty={isEmpty}>
      <UnorderedList>
        {data.map((row, index) => (
          <MostPatternedKeysListItem onClick={handleRowClick} item={row} key={index} />
        ))}
      </UnorderedList>
    </OverviewStateBoundary>
  );
}

const MostPatternedKeysListItem = ({
  item,
  onClick,
}: {
  item: PatternedSecretsResult;
  onClick?: (event) => void;
}) => {
  const makeOverviewUrl = useMakeOverviewUrl();
  const baseUrl = `/risks/secrets`;

  return (
    <PatternedKeysListItem>
      <Card
        to={makeOverviewUrl({
          baseUrl,
          query: {
            SecretHash: [item.secretHash],
          },
        })}
        onClick={onClick}>
        <SecretProviderContainer>
          <>
            <VendorIcon name={item.externalPlatform} />
            <EllipsisText>{item.secretTypeDescription}</EllipsisText>
            {item.validationResult === 'Valid' && (
              <Tooltip
                content={
                  <>
                    <Heading4>Valid secret</Heading4>
                    Last checked as valid:{' '}
                    <DateTime
                      date={new Date(item.lastFoundValid)}
                      format={dateFormats.usDateTime}
                    />
                  </>
                }>
                <SvgIcon name="WarningOutline" />
              </Tooltip>
            )}
            {item.insights.find(insight => insight.badge === 'Public repository') && (
              <InsightTag
                size="medium"
                insight={{
                  badge: 'Public Repository',
                  description: 'Public Repository',
                  sentiment: 'Negative',
                }}
                disableTooltip
              />
            )}
          </>
        </SecretProviderContainer>
        <Heading5>{item.count.toLocaleString()}</Heading5>
      </Card>
    </PatternedKeysListItem>
  );
};

const PatternedKeysListItem = styled(ListItem)`
  &:not(:last-child) {
    margin-bottom: 2.75rem;
  }

  ${Card} {
    --card-padding: 3rem;
    display: flex;
    justify-content: space-between;
    height: 11rem;
    font-size: var(--font-size-s);
    box-shadow: var(--elevation-0);
    gap: 2rem;

    &:hover {
      box-shadow: var(--elevation-2);
    }

    ${BaseIcon} {
      min-width: 6rem;
    }
  }
`;

const SecretProviderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 93%;
`;
