import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { SelectionCard } from '@src-v2/components/cards/selection-card';
import { Gutters } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { Heading, Paragraph } from '@src-v2/components/typography';

export function ApplicationTypeSelection() {
  return (
    <>
      <SelectionCard
        to="/profiles/applications/create/multiple"
        data-test-marker="multiple-app-select">
        <Heading>Multiple Assets</Heading>
        <Paragraph>
          Collect repositories, repository-groups and projects into an application
        </Paragraph>
      </SelectionCard>
      <SelectionCard to="/profiles/applications/create/mono" data-test-marker="mono-app-select">
        <Heading>Monorepo</Heading>
        <Paragraph>Collect modules from a monorepo into an application</Paragraph>
      </SelectionCard>
    </>
  );
}

export function SelectionLayout({ children }) {
  return (
    <Page title="Create Application">
      <PageContent>
        <AsyncBoundary>{children}</AsyncBoundary>
      </PageContent>
    </Page>
  );
}

const PageContent = styled(Gutters)`
  padding-top: 12rem;
  padding-bottom: 12rem;
`;
