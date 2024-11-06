import _ from 'lodash';
import { useMemo } from 'react';
import styled from 'styled-components';
import { InsightTag } from '@src-v2/components/tags';
import { Insight } from '@src-v2/types/risks/insight';
import { StyledProps } from '@src-v2/types/styled';

export const ElementInsights = styled(
  ({ insights, ...props }: StyledProps<{ insights: Insight[] }>) => {
    const orderedInsightsBySentiment = useMemo(() => {
      const groupedInsights = _.groupBy(insights, ({ sentiment }) => sentiment);
      return _.sortBy(Object.entries(groupedInsights), ([sentiment]) => {
        switch (sentiment) {
          case 'Negative':
            return 0;
          case 'Positive':
            return 1;
          default:
            return 2;
        }
      }).map(([, insights]) => insights);
    }, [insights]);

    return (
      <div {...props}>
        {Object.values(orderedInsightsBySentiment).map((groupedInsights, index) => (
          <InsightsGroup key={index}>
            {groupedInsights.map((insight, index) => (
              <InsightTag key={index} insight={insight} />
            ))}
          </InsightsGroup>
        ))}
      </div>
    );
  }
)`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const InsightsGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 2rem;
`;
