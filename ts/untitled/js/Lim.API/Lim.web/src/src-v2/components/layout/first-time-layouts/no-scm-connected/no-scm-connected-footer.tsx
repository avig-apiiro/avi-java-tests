import styled from 'styled-components';

export const NoScmConnectedFooter = props => {
  return (
    <DetailsContainer {...props}>
      <DetailsContent>
        <DetailsText>
          Build an inventory of code components (SBOM/XBOM) to map your application architecture and
          attack surface, including your: APIs, PII data, authentication, encryption, and other
          frameworks, OSS dependencies, contributors, and other relevant technologies.
        </DetailsText>
        <DetailsText>
          Following any material code changes, run a risk assessment on your code repositories and
          further leverage Apiiro’s risk detection capabilities across your open source
          dependencies, secrets, API security weaknesses, and supply chain security.
        </DetailsText>
      </DetailsContent>
    </DetailsContainer>
  );
};

const DetailsContainer = styled.div`
  width: calc(100% + 6rem);
  height: 100%;
  display: flex;
  justify-content: center;
  padding: 6rem 10rem;
  background-color: var(--color-blue-25);
  margin: 0 -3rem;
  overflow: hidden;
  z-index: 2;
`;

const DetailsContent = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  justify-items: center;
  gap: 17rem;
  max-width: 500rem;
`;

const DetailsText = styled.span`
  max-width: 125rem;
  font-size: var(--font-size-s);
  font-weight: 300;
  align-content: center;
`;
