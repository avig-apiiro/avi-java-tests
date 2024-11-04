import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { ProfileRelatedPaneHeader } from '@src-v2/components/entity-pane/common/profile-related-pane-header';
import { Pane, PaneProps } from '@src-v2/components/panes/pane';
import { PaneBody } from '@src-v2/components/panes/pane-body';
import { PaneStickyHeader } from '@src-v2/components/panes/pane-sticky-header';
import { Title } from '@src-v2/components/typography';
import { AboutThisModuleCard } from '@src-v2/containers/code-module-pane/about-this-module-card';
import {
  CodeModuleContextProvider,
  useCodeModuleContext,
} from '@src-v2/containers/code-module-pane/code-module-context-provider';
import { useDetectScrolling } from '@src-v2/hooks/dom-events/use-detect-scrolling';

export function CodeModulePane({
  repositoryKey,
  moduleKey,
  ...props
}: {
  repositoryKey: string;
  moduleKey: string;
} & PaneProps) {
  const [scrolled, onScroll] = useDetectScrolling();

  return (
    <Pane {...props}>
      <AsyncBoundary>
        <CodeModuleContextProvider repositoryKey={repositoryKey} moduleKey={moduleKey}>
          <PaneStickyHeader scrolled={scrolled}>
            <CodeModuleHeader />
          </PaneStickyHeader>

          <ModulePaneBody onScroll={onScroll}>
            <AboutThisModuleCard />
          </ModulePaneBody>
        </CodeModuleContextProvider>
      </AsyncBoundary>
    </Pane>
  );
}

const ModulePaneBody = styled(PaneBody)`
  padding-top: 4rem;
`;

function CodeModuleHeader() {
  const { module, repositoryProfile, applications, orgTeams } = useCodeModuleContext();

  return (
    <ProfileRelatedPaneHeader
      repositoryProfile={repositoryProfile}
      applications={applications}
      orgTeams={orgTeams}>
      <Title>{module.name}</Title>
    </ProfileRelatedPaneHeader>
  );
}
