import styled from 'styled-components';
import { VendorCircle } from '@src-v2/components/circles';
import { Size } from '@src-v2/components/types/enums/size';
import { Paragraph } from '@src-v2/components/typography';

export const ArtifactRepositoryTooltip = ({ repositoryProfile }: { repositoryProfile: any }) => (
  <ArtifactRepositoryTooltipContent>
    <Paragraph>
      Connection:
      <VendorCircle
        name={repositoryProfile.server?.provider || repositoryProfile.provider}
        size={Size.SMALL}
      />
      {repositoryProfile.serverUrl}
    </Paragraph>
    {repositoryProfile.projectId &&
      repositoryProfile.server?.provider !== 'Github' &&
      repositoryProfile.provider !== 'Github' && (
        <Paragraph>Repository group: {repositoryProfile.projectId}</Paragraph>
      )}
    <Paragraph>Repository: {repositoryProfile.name ?? repositoryProfile.displayName}</Paragraph>
    <Paragraph>
      Branch: {repositoryProfile.referenceName ?? repositoryProfile.defaultBranch}
    </Paragraph>
  </ArtifactRepositoryTooltipContent>
);

const ArtifactRepositoryTooltipContent = styled.div`
  ${Paragraph} {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
`;
