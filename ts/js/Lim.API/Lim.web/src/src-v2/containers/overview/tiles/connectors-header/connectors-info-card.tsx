import { useMemo } from 'react';
import styled from 'styled-components';
import { TextButton } from '@src-v2/components/button-v2';
import { CircleGroup, VendorStack } from '@src-v2/components/circles';
import { ClampText } from '@src-v2/components/clamp-text';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { BaseIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Heading5 } from '@src-v2/components/typography';
import { ConnectorsSummaryDropdown } from '@src-v2/containers/overview/tiles/connectors-header/connectors-summary-dropdown';
import {
  ExpandableProviderGroupTypes,
  providerGroupTypeToLabel,
} from '@src-v2/containers/overview/tiles/connectors-header/types';
import { useInject, useSuspense } from '@src-v2/hooks';
import { SDLCInfoResult } from '@src-v2/types/overview/overview-responses';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { humanize } from '@src-v2/utils/string-utils';

export function ConnectorsInfoCard({
  item,
  categoryKey,
}: {
  item: SDLCInfoResult;
  categoryKey: string;
}) {
  const { connectors } = useInject();
  const providerTypes = useSuspense(connectors.getProviderTypes);

  const [linkTo, noConnectionMessage] = useMemo(() => {
    const url = providerTypes.some(provider => provider.key === item.type)
      ? `/connectors/connect/${item.type}`
      : `/connectors/connect/${categoryKey}/${item.type}`;

    return [url, item.hasConnections ? null : 'Connect'];
  }, [item]);

  return (
    <ConnectorInfoCardContentContainer data-extended={dataAttr(isExpandable(item))}>
      <InfoCardRow>
        <Heading5>
          <ClampText>{providerGroupTypeToLabel[item.type] ?? humanize(item.type)}</ClampText>
        </Heading5>
      </InfoCardRow>
      <InfoCardRow>
        <TextButton disabled={item.count === 0} to={linkTo} size={Size.XXSMALL}>
          {item.vendors.length} connectors
        </TextButton>
      </InfoCardRow>

      {noConnectionMessage ? (
        <InfoCardRow>
          <TextButton data-no-connection underline showArrow size={Size.XXSMALL} to={linkTo}>
            {noConnectionMessage}
          </TextButton>
        </InfoCardRow>
      ) : (
        <InfoCardRow data-noconnection={dataAttr(Boolean(noConnectionMessage))}>
          <VendorStack vendors={item.vendors} size={Size.SMALL} />
        </InfoCardRow>
      )}

      {isExpandable(item) && (
        <ConnectorsSummaryDropdown
          linkTo={linkTo}
          item={item}
          maxHeight="100rem"
          providerTypes={providerTypes}
        />
      )}
    </ConnectorInfoCardContentContainer>
  );
}

const InfoCardRow = styled.div`
  display: flex;
  justify-content: space-between;

  ${Heading5} {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  ${CircleGroup} {
    margin-top: 2rem;
  }

  ${TextButton}[data-no-connection] {
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
`;

export const ConnectorInfoCardContentContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 3rem 4rem 3rem 4rem;
  flex: 1;
  border-radius: 0;

  ${DropdownMenu} {
    position: absolute;
    top: 3rem;
    right: 3rem;
    border: 0.25rem solid var(--color-blue-gray-30);

    ${BaseIcon} {
      color: var(--color-blue-gray-50);
    }
  }

  &:not(:last-child):before {
    right: 0;
    top: 6rem;
    content: '';
    position: absolute;
    border-right: 1px solid var(--color-blue-gray-20);
    height: calc(100% - 8rem);
    width: 1px;
  }

  &[data-extended] {
    padding: 3rem 8rem 3rem 4rem;
  }
`;

export const isExpandable = item =>
  item.count > 0 && Object.values(ExpandableProviderGroupTypes).includes(item.type);
