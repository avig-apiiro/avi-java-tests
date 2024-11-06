import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { BaseIcon, VendorIcon } from '@src-v2/components/icons';
import { Heading, Paragraph } from '@src-v2/components/typography';
import { useProviderModalSettings } from '@src-v2/containers/modals/issues/providers-issue-modals';
import { customScrollbar } from '@src-v2/style/mixins';

export function IssuePreview({ provider, riskData, summary: fixedSummary }) {
  const { summaryFieldKey, descriptionFieldKey, showLinkToCode } =
    useProviderModalSettings(provider);

  const { watch } = useFormContext();
  const [project, issueType, summary, description] = watch([
    'project',
    'issueType',
    summaryFieldKey,
    descriptionFieldKey,
  ]);

  return (
    <IssuePreviewLayout
      provider={provider}
      header={`${project?.name ?? 'Project Name'}${issueType ? ` | ${issueType.name}` : ''}`}
      body={{
        title: fixedSummary ?? summary,
        subtitle: riskData.riskName,
        description,
      }}
      showLinkToCode={showLinkToCode}
    />
  );
}

function IssuePreviewLayout({
  provider,
  header,
  body: { title, subtitle, description } = { title: null, subtitle: null, description: null },
  showLinkToCode,
  ...props
}) {
  return (
    <Container {...props}>
      <Paragraph>
        <VendorIcon name={provider} />
        {header}
      </Paragraph>

      <Heading>{title}</Heading>
      <Paragraph>{subtitle}</Paragraph>
      <Paragraph>{description}</Paragraph>

      <FakeLink>View in Apiiro</FakeLink>
      {showLinkToCode && <FakeLink>Link to code</FakeLink>}
    </Container>
  );
}

const Container = styled.div`
  min-height: 44.5rem;
  max-height: 56rem;
  padding: 4rem;
  font-size: var(--font-size-s);
  font-weight: 300;
  background-color: var(--color-blue-gray-15);
  ${customScrollbar};

  > ${Paragraph} {
    &:first-child {
      display: flex;
      align-items: center;
      gap: 1rem;

      ${BaseIcon} {
        width: 3rem;
        height: 3rem;
      }
    }

    &:last-of-type {
      margin-bottom: 4rem;
      white-space: pre-wrap;
    }
  }
`;

const FakeLink = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-purple-50);
`;
