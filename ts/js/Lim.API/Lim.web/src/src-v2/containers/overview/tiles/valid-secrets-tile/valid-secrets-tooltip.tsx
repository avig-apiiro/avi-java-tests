import { RenderTooltipParams } from '@visx/xychart/lib/components/Tooltip';
import styled from 'styled-components';
import { BaseIcon, VendorIcon } from '@src-v2/components/icons';
import { Heading, ListItem, Paragraph, UnorderedList } from '@src-v2/components/typography';
import {
  AggregatedSecretsData,
  ProviderToValidSecrets,
} from '@src-v2/types/overview/secrets-overview-responses';
import { isTypeOf } from '@src-v2/utils/ts-utils';

export function ValidSecretsTooltipContent({
  tooltipData: {
    nearestDatum: { datum },
  },
}: RenderTooltipParams<ProviderToValidSecrets>) {
  return !isTypeOf<AggregatedSecretsData<ProviderToValidSecrets>>(datum, 'data') ? (
    <TooltipItem item={datum} />
  ) : (
    <>
      <Heading>
        <ItemContainer>
          <Heading>{datum.provider}</Heading>
          <Heading>{datum.count}</Heading>
        </ItemContainer>
      </Heading>
      <UnorderedList>
        {datum.data?.map((item, index) => (
          <ListItem key={index}>
            <TooltipItem item={item} />
          </ListItem>
        ))}
      </UnorderedList>
    </>
  );
}

const ItemContainer = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
  gap: 1rem;

  ${Heading} {
    font-size: var(--font-size-m);

    &:not(:last-child) {
      flex-grow: 1;
      margin-bottom: 0;
    }
  }

  ${Paragraph} {
    font-size: var(--font-size-s);

    &:not(:last-child) {
      flex-grow: 1;
      margin-bottom: 0;
    }
  }

  ${BaseIcon} {
    width: 5rem;
    height: 5rem;
  }
`;

function TooltipItem({ item }: { item: ProviderToValidSecrets }) {
  return (
    <ItemContainer>
      <VendorIcon name={item.provider} />
      <Paragraph>{item.provider}</Paragraph>
      <Paragraph>{item.count}</Paragraph>
    </ItemContainer>
  );
}
