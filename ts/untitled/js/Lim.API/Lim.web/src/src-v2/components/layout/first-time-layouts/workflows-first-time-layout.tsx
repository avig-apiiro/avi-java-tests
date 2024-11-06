import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { ConnectEmptyLayout } from '@src-v2/components/layout';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { ExternalLink } from '@src-v2/components/typography';

export const WorkflowsFirstTimeLayout = ({ onClick }: { onClick: () => void }) => (
  <ConnectEmptyLayout
    title="Create your first workflow!"
    description={
      <>
        <ConnectEmptyLayout.Text>
          Leverage the power of Apiiro automation for proactive action.
        </ConnectEmptyLayout.Text>
        <ConnectEmptyLayout.Text>
          Build workflows to trigger notifications, assign issues, make pull request comments,
          create tickets, produce Pentesting reports, and more.{' '}
        </ConnectEmptyLayout.Text>
        <ConnectEmptyLayout.Text>
          For more information,{' '}
          <ExternalLink href="https://docs.apiiro.com/workflows_generic#creating-a-workflow">
            see the Apiiro User Docs
          </ExternalLink>
        </ConnectEmptyLayout.Text>
      </>
    }>
    <ActionsContainer>
      <Button variant={Variant.PRIMARY} onClick={onClick}>
        Create workflow
      </Button>
      or
      <Button variant={Variant.SECONDARY} to="/workflows/recipes">
        Check out our recipes
      </Button>
    </ActionsContainer>
  </ConnectEmptyLayout>
);

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;
