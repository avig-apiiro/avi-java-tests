import styled from 'styled-components';
import { CollapsibleCard } from '@src-v2/components/cards';
import { RemediationSteps } from '@src-v2/components/entity-pane/remediation/remediation-steps';
import { Paragraph, Strong } from '@src-v2/components/typography';

export function FixSecretCard() {
  return (
    // @ts-ignore
    <CollapsibleCard defaultOpen title="How to fix this risk?">
      <Steps>
        <Paragraph>
          <Strong>Verify that the secret is actually used:</Strong> Sometimes people leave unused
          secrets in code, so no need to start replacing and securing them. <Strong>Note:</Strong>{' '}
          the secret can be used in other places as well.
        </Paragraph>

        <Paragraph>
          <Strong>Generate a new secret:</Strong> Generate a new secret to replace the old one, do
          not revoke the secret yet. The new secret should be securely stored and managed
        </Paragraph>

        <Paragraph>
          <Strong>Update the code with the new secret:</Strong> After the new secret is generated,
          update the code with the new value. Make sure to use secure storage methods for the new
          secret, such as environment variables or a secure key vault.
        </Paragraph>

        <Paragraph>
          <Strong>Remove the old secret from the code:</Strong> Depending on how the code is
          managed, this may involve changing your version control system or editing the code
          directly
        </Paragraph>

        <Paragraph>
          <Strong>Revoke the compromised secret:</Strong> After the secret is removed from the code,
          revoke the compromised secret to prevent further unauthorized access. You can usually do
          this in the cloud API provider's console or the CLI. <Strong>Note:</Strong> Make sure that
          there are no other places using the same secret, as revoking the secret could cause
          downtime in other places in the system.
        </Paragraph>

        <Paragraph>
          <Strong>Review and protect:</Strong> Finally, review access controls and monitoring to
          ensure that only authorized users have access to the new secret and that any unauthorized
          attempts to access the secret are detected and responded to.
        </Paragraph>
      </Steps>
    </CollapsibleCard>
  );
}

const Steps = styled(RemediationSteps)`
  margin-bottom: 4rem;
`;
