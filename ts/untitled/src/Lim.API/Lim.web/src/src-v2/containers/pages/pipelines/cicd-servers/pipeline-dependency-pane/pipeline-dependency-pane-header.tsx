import styled from 'styled-components';
import { Heading3, SubHeading3 } from '@src-v2/components/typography';
import { usePipelineDependencyContext } from '@src-v2/containers/pages/pipelines/cicd-servers/pipeline-dependency-pane/pipeline-dependency-context-provider';

export function PipelineDependencyPaneHeader() {
  const {
    serverDependencyInfo: { dependency, serverUrl },
  } = usePipelineDependencyContext();

  return (
    <Container>
      <HeaderWrapper>
        <Heading3>{dependency.name}</Heading3>
        <SubHeading3>{serverUrl}</SubHeading3>
      </HeaderWrapper>
      <HorizontalLine />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  margin-bottom: 1rem;
  justify-content: center;
  gap: 4rem;
`;

const HorizontalLine = styled.hr`
  border-bottom: 0.25rem solid var(--color-blue-gray-20);
  width: 100%;
`;

const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;
