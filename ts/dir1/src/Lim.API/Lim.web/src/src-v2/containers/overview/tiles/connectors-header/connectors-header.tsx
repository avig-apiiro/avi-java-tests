import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Card } from '@src-v2/components/cards';
import { ControlledScroll } from '@src-v2/components/controlled-scroll';
import { SvgIcon } from '@src-v2/components/icons';
import { Caption1, Paragraph } from '@src-v2/components/typography';
import {
  ConnectorInfoCardContentContainer,
  ConnectorsInfoCard,
} from '@src-v2/containers/overview/tiles/connectors-header/connectors-info-card';
import { useCombinedConnectors } from '@src-v2/containers/overview/tiles/connectors-header/hooks';
import { dataAttr } from '@src-v2/utils/dom-utils';

export const ConnectorsHeader = () => {
  const { sdlcConnectorsEntries, itConnectorsEntries } = useCombinedConnectors();

  const sdlcConnectorsTotal = calculateTotal(sdlcConnectorsEntries);
  const itConnectorsTotal = calculateTotal(itConnectorsEntries);

  return (
    <AsyncBoundary>
      <HeaderContainer>
        <PrimarySegmentContainer>
          <ControlledScroll controllerButtonPosition="center" scrollGap={150} scrollOffset={10}>
            {sdlcConnectorsEntries.map(([categoryKey, sdlcInfoResults], index) => (
              <CategoryContainer
                key={`sdlc-${categoryKey}-${index}`}
                size={sdlcInfoResults?.length}
                total={sdlcConnectorsTotal}>
                <Category data-last={dataAttr(index === sdlcConnectorsEntries.length - 1)}>
                  <CardsContainer>
                    {sdlcInfoResults.map((sdlcInfoResult, cardIndex) => (
                      <ConnectorsInfoCard
                        key={`${categoryKey}-${sdlcInfoResult.type}-${cardIndex}`}
                        item={sdlcInfoResult}
                        categoryKey={categoryKey}
                      />
                    ))}
                  </CardsContainer>
                </Category>
                <CaptionContainer size={sdlcInfoResults?.length}>
                  <Caption1>{categoryKey}</Caption1>
                  {Array.from({ length: sdlcInfoResults?.length || 0 }).map((_, index) => (
                    <ProgressIndicator key={`progress-${index}`} />
                  ))}
                </CaptionContainer>
              </CategoryContainer>
            ))}
          </ControlledScroll>
        </PrimarySegmentContainer>
        <SecondarySegmentContainer>
          <ItConnectorsLabel />
          <ControlledScroll controllerButtonPosition="center" scrollGap={150} scrollOffset={10}>
            {itConnectorsEntries.map(([categoryKey, sdlcInfoResults], index) => (
              <CategoryContainer
                key={`it-${categoryKey}-${index}`}
                size={sdlcInfoResults?.length}
                total={itConnectorsTotal}>
                <Category data-last={dataAttr(index === itConnectorsEntries.length - 1)}>
                  <CardsContainer>
                    {sdlcInfoResults.map((sdlcInfoResult, cardIndex) => (
                      <ConnectorsInfoCard
                        key={`${categoryKey}-${sdlcInfoResult.type}-${cardIndex}`}
                        item={sdlcInfoResult}
                        categoryKey={categoryKey}
                      />
                    ))}
                  </CardsContainer>
                </Category>
              </CategoryContainer>
            ))}
          </ControlledScroll>
        </SecondarySegmentContainer>
      </HeaderContainer>
    </AsyncBoundary>
  );
};

const CategoryContainer = styled.div<{ size: number; total: number }>`
  --data-min-width: 37rem;

  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: ${({ size, total }) => (size * 100) / total}%;
  min-width: ${({ size }) => `calc(${size} * var(--data-min-width))`};
`;

const ProgressIndicator = styled(props => <SvgIcon name="ProgressArrows" {...props} />)`
  scale: 1.5;
  translate: -2rem 0;
`;

const ItConnectorsLabel = styled(props => <Caption1 {...props}>IT systems</Caption1>)`
  width: calc(100% - 5rem);
  display: flex;
  justify-content: center;
  position: absolute;
  bottom: 3rem;
  left: 3rem;
  right: 3rem;
  height: 6rem;
  border-radius: 2rem;
  background-color: var(--color-blue-gray-15);
  line-height: 2;
  color: var(--color-blue-gray-55);
`;

const HeaderContainer = styled.div`
  display: flex;
  gap: 4rem;
  margin: 2rem 0 5rem 0;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;

  ${ControlledScroll} {
    padding: 2rem 0 2rem 0;
  }
`;

const SegmentContainer = styled.div`
  position: relative;
  background-color: white;
  display: flex;
  gap: 2rem;
  box-shadow: var(--elevation-0);
  border-radius: 3rem;
  padding: 0 2rem 1rem 2rem;
  width: 100%;

  ${ControlledScroll} {
    position: relative;
    width: 100%;
  }
`;

const PrimarySegmentContainer = styled(SegmentContainer)`
  min-width: 215rem;

  @media (max-width: 1600px) {
    min-width: 95rem;
  }

  &:before {
    content: '';
    position: absolute;
    bottom: 3rem;
    left: 3rem;
    right: 3rem;
    height: 6rem;
    border-radius: 2rem;
    background-color: var(--color-blue-gray-15);
  }
`;

const SecondarySegmentContainer = styled(SegmentContainer)`
  flex: 1;
  min-width: 100rem;

  ${ConnectorInfoCardContentContainer} {
    min-width: 45rem;
  }
`;

const CardsContainer = styled.div`
  display: flex;
  gap: 2rem;
  flex-grow: 1;

  ${Card} {
    flex: 1;
    padding: 2rem 3rem;

    ${Paragraph} {
      margin-bottom: 0;
      font-size: var(--font-size-s);
    }
  }
`;

const Category = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  font-size: var(--font-size-s);
  position: relative;
  padding: 0;
  width: 100%;
  flex: 1;

  &:not([data-last]):before {
    right: 0;
    top: 6rem;
    content: '';
    position: absolute;
    border-right: 1px solid var(--color-blue-gray-20);
    height: calc(100% - 8rem);
  }

  > ${Paragraph} {
    margin-bottom: 0;
    text-align: center;
    color: var(--color-blue-gray-60);
  }
`;

const CaptionContainer = styled.div<{ size: number }>`
  width: 100%;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0 1rem 0;
  font-size: var(--font-size-s);
  overflow: visible;

  ${Caption1} {
    color: var(--color-blue-gray-55);
    margin-left: 3rem;
  }
`;

const calculateTotal = (entries: [string, any[]][]) => {
  return entries.reduce((acc, [, results]) => acc + (results?.length || 0), 0);
};
