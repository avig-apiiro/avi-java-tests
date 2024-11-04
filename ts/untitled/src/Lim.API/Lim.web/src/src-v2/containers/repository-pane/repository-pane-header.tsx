import styled from 'styled-components';
import { VendorIcon } from '@src-v2/components/icons';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Subtitle, Title } from '@src-v2/components/typography';
import { useRepositoryContext } from '@src-v2/containers/repository-pane/repository-context-provider';

export function RepositoryPaneHeader() {
  const { repository } = useRepositoryContext();

  return (
    <Container>
      <Title>
        <VendorIcon name={(repository.providerGroup ?? repository.provider).toString()} />
        {repository.name}
      </Title>
      {repository.repositoryGroupId && (
        <Tooltip content="Repository group">
          <Subtitle>{repository.repositoryGroupId}</Subtitle>
        </Tooltip>
      )}
    </Container>
  );
}

const Container = styled.div`
  ${Title} {
    display: flex;
    margin-bottom: 2rem;
    align-items: center;
    gap: 1rem;
    font-size: var(--font-size-l);
  }

  ${Subtitle} {
    width: fit-content;
    margin-bottom: 2rem;
    font-size: var(--font-size-s);
    font-weight: 400;
  }
`;
