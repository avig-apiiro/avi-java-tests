import styled from 'styled-components';
import { Card } from '@src-v2/components/cards';
import { ClampText } from '@src-v2/components/clamp-text';
import { BaseIcon } from '@src-v2/components/icons';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { ListItem, UnorderedList } from '@src-v2/components/typography';
import { useMakeOverviewUrl } from '@src-v2/containers/overview/tiles/utils';
import { OverviewTopRisksItem } from '@src-v2/types/overview/overview-responses';

export function RisksOverviewList({
  data,
  to = '',
  onClick,
}: {
  data: OverviewTopRisksItem[];
  to?: string;
  onClick?: (event) => void;
}) {
  const makeOverviewUrl = useMakeOverviewUrl();

  const baseUrl = to.length > 0 ? `/risks/${to}` : '/risks';

  return (
    <UnorderedList>
      {data.map((row, index) => (
        <OverviewListItem key={index}>
          <Card
            to={makeOverviewUrl({
              baseUrl,
              query: { searchTerm: row.ruleName, RiskLevel: [row.severity] },
              devPhase: row.devPhase,
            })}
            onClick={onClick}>
            <RiskIcon riskLevel={row.severity} />
            <ClampText>{row.ruleName}</ClampText>
            <Counter>{row.count.toLocaleString()}</Counter>
          </Card>
        </OverviewListItem>
      ))}
    </UnorderedList>
  );
}

const OverviewListItem = styled(ListItem)`
  &:not(:last-child) {
    margin-bottom: 2.75rem;
  }

  ${Card} {
    --card-padding: 3rem;
    display: flex;
    height: 11rem;
    align-items: center;
    font-size: var(--font-size-s);
    gap: 2rem;
    box-shadow: var(--elevation-0);

    &:hover {
      box-shadow: var(--elevation-2);
    }

    ${BaseIcon} {
      min-width: 6rem;
    }
  }
`;

const Counter = styled.span`
  font-weight: 600;
`;
