import styled from 'styled-components';
import { InsightTag } from '@src-v2/components/tags';
import { Size } from '@src-v2/components/types/enums/size';
import { Paragraph, Strong } from '@src-v2/components/typography';
import { CommitCodeReference } from '@src-v2/containers/commit/common-componnets';
import { StubAny } from '@src-v2/types/stub-any';

export const EntityInsightsMaterialChange = ({
  materialChange,
  repository,
  commitSha,
}: {
  materialChange: StubAny;
  repository: StubAny;
  commitSha: string;
}) => {
  return (
    <>
      <Paragraph>
        Insights for {materialChange.pullRequestEntityName}{' '}
        <Strong>{materialChange.diffableDisplayName}</Strong>
        {materialChange.codeReference && (
          <>
            {' '}
            in file{' '}
            <CommitCodeReference
              repository={repository}
              relativeFilePath={materialChange.codeReference.relativeFilePath}
              commitSha={commitSha}>
              {materialChange.codeReference.relativeFilePath}
            </CommitCodeReference>
          </>
        )}
        :
      </Paragraph>
      <InsightsContainer>
        {materialChange.insights.map((insight, index) => (
          <InsightTag key={index} size={Size.SMALL} insight={insight} />
        ))}
      </InsightsContainer>
    </>
  );
};

const InsightsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;
