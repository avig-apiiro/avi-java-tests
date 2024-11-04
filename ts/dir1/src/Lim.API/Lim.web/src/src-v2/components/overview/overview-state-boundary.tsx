import { Fragment, ReactNode } from 'react';
import styled from 'styled-components';
import emptyStateCactusImageUrl from '@src-v2/assets/images/empty-state-cactus.svg';
import emptyBox from '@src-v2/assets/images/empty-state/empty-box.svg';
import NoResultsFlashlight from '@src-v2/assets/images/empty-state/no-results-flashlight.svg';
import { Button } from '@src-v2/components/button-v2';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Paragraph } from '@src-v2/components/typography';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { dataAttr } from '@src-v2/utils/dom-utils';

enum OverviewStateMode {
  None,
  NoMonitored,
  NoSCM,
  Disabled,
  Custom,
}

enum NewOverviewStateMode {
  None = 'none',
  Disabled = 'disabled',
  NoData = 'no-data',
  NoResults = 'no-results',
  IsEmpty = 'empty',
}

export const OverviewStateBoundary = ({
  isDisabled = false,
  isEmpty = false,
  noData = false,
  isRisksTile = false,
  noCTA = false,
  customEmptyStateCTA = <Fragment />,
  children,
  ...props
}: {
  isDisabled?: boolean;
  isEmpty?: boolean;
  noData?: boolean;
  isRisksTile?: boolean;
  noCTA?: boolean;
  customEmptyStateCTA?: ReactNode;
  children: ReactNode;
}) => {
  const { application } = useInject();
  const stateMode: OverviewStateMode = isDisabled
    ? OverviewStateMode.Disabled
    : !application.integrations.connectedToScm
      ? OverviewStateMode.NoSCM
      : !application.integrations.hasMonitoredRepositories
        ? OverviewStateMode.NoMonitored
        : isEmpty
          ? OverviewStateMode.Custom
          : OverviewStateMode.None;

  if (application.isFeatureEnabled(FeatureFlag.EmptyStates)) {
    const newStateMode = isDisabled
      ? NewOverviewStateMode.Disabled
      : noData
        ? NewOverviewStateMode.NoData
        : isEmpty
          ? NewOverviewStateMode.IsEmpty
          : NewOverviewStateMode.None;

    if (newStateMode === NewOverviewStateMode.None) {
      return <>{children}</>;
    }

    const Image =
      newStateMode === NewOverviewStateMode.Disabled || newStateMode === NewOverviewStateMode.NoData
        ? EmptyBoxImage
        : NoResultsFlashlight;

    return (
      <StateContainer {...props}>
        <Image />
        {newStateMode === NewOverviewStateMode.Disabled ? (
          <Paragraph data-disabled-state>
            No data available as one or more applications are module-based
          </Paragraph>
        ) : (
          <>
            {newStateMode === NewOverviewStateMode.IsEmpty ? (
              <Paragraph>No results found</Paragraph>
            ) : (
              <Paragraph>No data available</Paragraph>
            )}
            {newStateMode === NewOverviewStateMode.NoData && customEmptyStateCTA}
          </>
        )}
      </StateContainer>
    );
  }

  if (stateMode === OverviewStateMode.None) {
    return <>{children}</>;
  }

  return (
    <StateContainer {...props}>
      {isRisksTile ? (
        <NoResultsFlashlight />
      ) : (
        <img src={emptyStateCactusImageUrl} alt="empty-state-risks-icon" />
      )}
      {stateMode === OverviewStateMode.Disabled ? (
        <Paragraph data-disabled-state>
          No data available as one or more applications are module-based
        </Paragraph>
      ) : (
        <>
          <Paragraph data-risk-tile={dataAttr(isRisksTile)}>
            No {isRisksTile ? 'results found' : 'data available'}
          </Paragraph>
          {!noCTA &&
            (stateMode === OverviewStateMode.NoSCM ? (
              <Button
                to="connectors/connect/sourceCode"
                variant={Variant.PRIMARY}
                endIcon="Arrow"
                size={Size.LARGE}>
                Connect your source code
              </Button>
            ) : stateMode === OverviewStateMode.NoMonitored ? (
              <Button
                to="connectors/manage/repositories"
                variant={Variant.PRIMARY}
                endIcon="Arrow"
                size={Size.LARGE}>
                Monitor your repositories
              </Button>
            ) : (
              customEmptyStateCTA
            ))}
        </>
      )}
    </StateContainer>
  );
};

const StateContainer = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: center;
  padding-bottom: 3rem;
  align-items: center;

  ${Paragraph} {
    font-size: var(--font-size-s);
    font-weight: 500;
    text-align: center;

    &[data-risk-tile] {
      margin-top: 0;
    }

    &[data-disabled-state] {
      padding: 0 6rem;
      font-size: var(--font-size-s);
    }
  }

  ${Button} {
    margin-top: 1rem;
  }
}
`;

const EmptyBoxImage = styled(emptyBox)`
  width: 40rem;
  height: 28rem;
`;
