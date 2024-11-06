import { ReactNode } from 'react';
import styled from 'styled-components';
import { CollapsibleCard } from '@src-v2/components/cards';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { RemediationSteps } from '@src-v2/components/entity-pane/remediation/remediation-steps';
import { ExternalLink, Paragraph } from '@src-v2/components/typography';
import { BranchProtectionElement } from '@src-v2/types/inventory-elements/branch-protection-element';

export function FixBranchProtectionCard() {
  const {
    element,
    risk,
    relatedProfile: { vendor },
  } = useEntityPaneContext<BranchProtectionElement>();

  const repositoryUrl = risk.relatedEntity.url;
  let steps;
  switch (vendor) {
    case 'Github':
      steps = <FixGithub element={element} repositoryUrl={repositoryUrl} />;
      break;
    case 'Gitlab':
      steps = <FixGitlab element={element} repositoryUrl={repositoryUrl} />;
      break;
    default:
      steps = <Steps>Contact one of the repository administrators</Steps>;
  }

  return (
    <CollapsibleCard defaultOpen title="How to fix this risk?">
      {steps}
    </CollapsibleCard>
  );
}

function FixGithub({ element, repositoryUrl }) {
  switch (element.ruleType) {
    case 'Deletion':
      return (
        <FixGithubInternal repositoryUrl={repositoryUrl}>
          <Paragraph>Uncheck "Allow deletions"</Paragraph>
          <Paragraph>Click "Save changes"</Paragraph>
        </FixGithubInternal>
      );
    case 'ForcePush':
      return (
        <FixGithubInternal repositoryUrl={repositoryUrl}>
          <Paragraph>Uncheck "Allow force pushes"</Paragraph>
          <Paragraph>Click "Save changes"</Paragraph>
        </FixGithubInternal>
      );
    case 'RequiredCodeReviewers':
      return (
        <FixGithubInternal repositoryUrl={repositoryUrl}>
          <Paragraph>Check "Require a pull request before merging"</Paragraph>
          <Paragraph>Check "Require approvals"</Paragraph>
          <Paragraph>
            Set "Required number of approvals before merging" to the desired number
          </Paragraph>
          <Paragraph>Click "Save changes"</Paragraph>
        </FixGithubInternal>
      );
    default:
      return <Steps />;
  }
}

function FixGithubInternal({
  children,
  repositoryUrl,
}: {
  children: ReactNode;
  repositoryUrl: string;
}) {
  return (
    <Steps>
      <Paragraph>Make sure you have admin permissions</Paragraph>
      <Paragraph>
        Go to the{' '}
        <ExternalLink href={`${repositoryUrl}/settings/branches`}>
          repository branch protection rules settings page
        </ExternalLink>
      </Paragraph>
      <Paragraph>
        Click "Edit" on the relevant branch rule or click on "Add branch protection rule" if no
        rules exist
      </Paragraph>

      {children}
    </Steps>
  );
}

function FixGitlab({ element, repositoryUrl }) {
  switch (element.ruleType) {
    case 'Deletion':
    case 'ForcePush':
      return <FixGitlabForcePushOrDeletion repositoryUrl={repositoryUrl} />;
    case 'RequiredCodeReviewers':
      return <FixGitlabRequiredCodeReviewers repositoryUrl={repositoryUrl} />;
    default:
      return <Steps>Contact one of the repository administrators</Steps>;
  }
}

function FixGitlabForcePushOrDeletion({ repositoryUrl }) {
  return (
    <Steps>
      <Paragraph>Make sure you have admin permissions</Paragraph>
      <Paragraph>
        Go to the{' '}
        <ExternalLink href={`${repositoryUrl}/-/settings/repository`}>
          project's "Repository" settings page
        </ExternalLink>
      </Paragraph>
      <Paragraph>Under "Protected branches" section</Paragraph>
      <Paragraph>Set "Branch" to the relevant branch</Paragraph>
      <Paragraph>Set "Allowed to merge" to "Maintainers"</Paragraph>
      <Paragraph>Set "Allowed to push and merge" to "No one"</Paragraph>
      <Paragraph>Make sure "Allowed to force push" is turned off</Paragraph>
      <Paragraph>Click "Protect"</Paragraph>
    </Steps>
  );
}

function FixGitlabRequiredCodeReviewers({ repositoryUrl }) {
  return (
    <Steps>
      <Paragraph>Make sure you have admin permissions</Paragraph>
      <Paragraph>
        Go to the{' '}
        <ExternalLink href={`${repositoryUrl}/-/settings/merge_requests`}>
          project's "Merge requests" settings page
        </ExternalLink>
      </Paragraph>
      <Paragraph>Under "Merge request approvals"</Paragraph>
      <Paragraph>
        In the row of "All eligible users" under "Approvals required" column, enter the desired
        number
      </Paragraph>
    </Steps>
  );
}

const Steps = styled(RemediationSteps)`
  margin-bottom: 4rem;
`;
