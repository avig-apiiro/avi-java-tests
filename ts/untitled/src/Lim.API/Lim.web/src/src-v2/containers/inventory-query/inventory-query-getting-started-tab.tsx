import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { Badge, BadgeColors } from '@src-v2/components/badges';
import { Button } from '@src-v2/components/button-v2';
import { Carousel } from '@src-v2/components/carousel';
import { FileReaderButton } from '@src-v2/components/file-reader-button';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { ExternalLink, Heading, Heading5 } from '@src-v2/components/typography';
import {
  InventoryQuerySettings,
  createQuerySettingsAnalyticsData,
  loadExportedQuerySettingsJson,
  useApiiroQlSchema,
  useImportQuery,
} from '@src-v2/containers/inventory-query/inventory-query-settings';
import { useInject, useSuspense } from '@src-v2/hooks';
import { FavoritesFolder, FavoritesLeafItem, isLeafItem } from '@src-v2/services';

type GetStartedInventoryTabProperties = {
  onNewTab: (querySettings: InventoryQuerySettings, select: boolean) => void;
};

export const GetStartedInventoryTab = ({
  onNewTab,
  ...props
}: GetStartedInventoryTabProperties) => {
  const trackAnalytics = useTrackAnalytics();

  const importQuery = useImportQuery(
    useCallback(
      querySettings => {
        trackAnalytics(AnalyticsEventName.ActionClicked, {
          [AnalyticsDataField.ActionType]: 'Import',
          [AnalyticsDataField.Source]: 'Getting started',
          ...createQuerySettingsAnalyticsData(querySettings),
        });

        onNewTab(querySettings, true);
        return Promise.resolve(true);
      },
      [onNewTab]
    )
  );

  return (
    <GettingStartedContainer {...props}>
      <Heading>Welcome to your Explorer workspace!</Heading>
      <ButtonsRow>
        <Button onClick={() => onNewTab(null, true)} variant={Variant.PRIMARY} size={Size.LARGE}>
          Compose a new query
        </Button>

        <FileReaderButton
          button={({ onClick }) => (
            <Button variant={Variant.SECONDARY} onClick={onClick} data-status="secondary">
              Import query
            </Button>
          )}
          onChange={importQuery}
        />
      </ButtonsRow>
      <span>Here are some basic queries to get you started with explorer:</span>
      <SuggestedQueriesGallery onNewTab={onNewTab} />
      <span>
        Need help?{' '}
        <ExternalLink href="https://docs.apiiro.com/risk-graph-explorer/risk_explorer">
          View our documentation
        </ExternalLink>
      </span>
    </GettingStartedContainer>
  );
};

type TaggedSuggestedQuery = {
  category: string;
  query: FavoritesLeafItem<InventoryQuerySettings>;
  new: boolean;
};

function getTaggedSuggestedQueriesFromFavorites(
  favorites: FavoritesFolder<InventoryQuerySettings>,
  category: string = ''
): TaggedSuggestedQuery[] {
  return favorites.folderContent.flatMap(folderContentItem =>
    isLeafItem(folderContentItem)
      ? [{ category, query: folderContentItem, new: folderContentItem.new }]
      : getTaggedSuggestedQueriesFromFavorites(folderContentItem, folderContentItem.name)
  );
}

const SuggestedQueriesGallery = styled(({ onNewTab, ...props }) => {
  const { inventoryQuery } = useInject();
  const trackAnalytics = useTrackAnalytics();
  const { apiiroQlSchema, querySchemaReady } = useApiiroQlSchema();

  const suggestedItems = useSuspense(inventoryQuery.getBetaFeatureFavoriteQueriesLibrary, {
    libraryName: 'explorer.gettingStarted',
  });

  const chunkedSuggestedItems = useMemo(() => {
    if (!suggestedItems) {
      return [];
    }

    const taggedSuggestedQueries = getTaggedSuggestedQueriesFromFavorites(suggestedItems);
    taggedSuggestedQueries.sort((a, b) => a.query.name.localeCompare(b.query.name));
    taggedSuggestedQueries.sort((a, b) => {
      if (a.new === b.new) {
        return 0;
      }
      if (a.new === true) {
        return -1;
      }
      return 1;
    });

    return _.chunk(taggedSuggestedQueries, 2);
  }, [suggestedItems]);

  const handleLoadSuggestedQuery = useCallback(
    (suggestedItem: TaggedSuggestedQuery) => {
      const importedQuerySettings = loadExportedQuerySettingsJson(
        apiiroQlSchema,
        suggestedItem.query.itemContent
      );

      trackAnalytics(AnalyticsEventName.ActionClicked, {
        [AnalyticsDataField.ActionType]: 'Load query',
        [AnalyticsDataField.Source]: 'Getting started',
        [AnalyticsDataField.QueryName]: suggestedItem.query.name,
        ...createQuerySettingsAnalyticsData(importedQuerySettings),
      });

      onNewTab(importedQuerySettings, true);
    },
    [trackAnalytics, onNewTab, apiiroQlSchema]
  );

  return (
    <div {...props}>
      {querySchemaReady && (
        <Carousel>
          {chunkedSuggestedItems.map((suggestedItemsChunk, index) => (
            <Carousel.Item key={index}>
              <SuggestedQueryColumn>
                {suggestedItemsChunk.map((suggestedItem, index) => (
                  <SuggestedQueryItem
                    key={index}
                    suggestedQuery={suggestedItem}
                    onLoadSuggestedQuery={() => handleLoadSuggestedQuery(suggestedItem)}
                  />
                ))}
              </SuggestedQueryColumn>
            </Carousel.Item>
          ))}
        </Carousel>
      )}
    </div>
  );
})`
  flex-grow: 1;
  position: relative;
  height: 110rem;

  ${Carousel} {
    position: absolute;
    width: 100%;

    ${Carousel.Content} {
      width: unset;
    }
  }
`;

function SuggestedQueryItem({
  suggestedQuery,
  onLoadSuggestedQuery,
}: {
  suggestedQuery: TaggedSuggestedQuery;
  onLoadSuggestedQuery: () => void;
}) {
  return (
    <SuggestedQueryItemContainer>
      <SuggestedQueryItemTop>
        <BadgesContainer>
          <Badge size={Size.XSMALL}>{suggestedQuery.category}</Badge>
          {suggestedQuery.new && (
            <Badge color={BadgeColors.Green} size={Size.XSMALL}>
              New
            </Badge>
          )}
        </BadgesContainer>
        <Heading5>{suggestedQuery.query.name}</Heading5>
        {suggestedQuery.query.itemContent.description}
      </SuggestedQueryItemTop>
      <SuggestedQueryItemBottom />
      <Button variant={Variant.SECONDARY} onClick={onLoadSuggestedQuery} size={Size.LARGE}>
        Try now
      </Button>
    </SuggestedQueryItemContainer>
  );
}

const SuggestedQueryItemContainer = styled.div`
  position: relative;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: stretch;

  width: 90rem;
  height: 50rem;

  background: var(--color-white);
  border: 1px solid var(--color-blue-gray-30);
  border-radius: 12px;

  overflow: hidden;

  ${Button} {
    position: absolute;
    bottom: 4rem;
    right: 4rem;
  }
`;

const SuggestedQueryItemTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 4rem;
  flex-grow: 1;
  font-weight: 300;
`;

const BadgesContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const SuggestedQueryItemBottom = styled.div`
  height: 8rem;
  border-top: 1px solid var(--color-blue-gray-30);
  background: var(--color-blue-40);
`;

const ButtonsRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  width: 100%;
`;

const GettingStartedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;

  position: relative;

  margin-top: 5rem;
  padding: 8rem;
  gap: 4rem;

  font-size: var(--font-size-s);
  line-height: 5rem;
  color: var(--color-blue-gray-70);

  background: white;

  box-shadow: 0 0 0.5rem 0.25rem var(--color-blue-gray-30);
  border-radius: 3rem;

  ${Heading} {
    font-weight: 600;
    font-size: var(--font-size-xxl);
    line-height: 9rem;

    margin-bottom: 4rem;
  }
`;

const SuggestedQueryColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;
`;
