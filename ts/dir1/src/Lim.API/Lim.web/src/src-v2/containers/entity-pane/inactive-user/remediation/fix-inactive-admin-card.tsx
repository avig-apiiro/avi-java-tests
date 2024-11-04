import styled from 'styled-components';
import { CollapsibleCard } from '@src-v2/components/cards';
import { RemediationSteps } from '@src-v2/components/entity-pane/remediation/remediation-steps';
import { ExternalLink, Paragraph } from '@src-v2/components/typography';
import { useContributorNotPushingCodeContext } from '@src-v2/containers/entity-pane/inactive-user/use-contributor-not-pushing-code-pane-context';
import { ProviderGroup } from '@src-v2/types/enums/provider-group';

export function FixInactiveAdminCard() {
  const {
    risk,
    relatedProfile: { vendor },
  } = useContributorNotPushingCodeContext();

  const vendorSpecificParagraph =
    vendor && vendor === ProviderGroup.Gitlab ? (
      <Paragraph>
        Go to the{' '}
        <ExternalLink href={`${risk.relatedEntity.url}/-/project_members`}>
          project's "Members" page
        </ExternalLink>
      </Paragraph>
    ) : (
      <Paragraph>
        Go to the{' '}
        <ExternalLink href={`${risk.relatedEntity.url}/settings/access`}>
          repository "Collaborators and teams" settings page
        </ExternalLink>
      </Paragraph>
    );

  return (
    <CollapsibleCard defaultOpen title="How to fix this risk?">
      <Steps>
        <Paragraph>Make sure you have admin permissions</Paragraph>
        {vendorSpecificParagraph}
        <Paragraph>Select the unwanted user and change its role</Paragraph>
      </Steps>
    </CollapsibleCard>
  );
}

const Steps = styled(RemediationSteps)`
  margin-bottom: 4rem;
`;
