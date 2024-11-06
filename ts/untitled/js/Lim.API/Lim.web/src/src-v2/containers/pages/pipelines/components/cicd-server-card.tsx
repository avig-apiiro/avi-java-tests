import { observer } from 'mobx-react';
import { ClampText } from '@src-v2/components/clamp-text';
import { CardTitle } from '@src-v2/components/panes/pane-body';
import {
  Header,
  PipelineAvatarWidget,
  PipelineCardWrapper,
  PipelineStatWidget,
  TitleWrapper,
  Widgets,
} from '@src-v2/containers/pages/pipelines/components/pipeline-card';
import { CICDServer } from '@src-v2/types/pipelines/pipelines-types';

export const CICDServerCard = observer(({ item: cicdServer }: { item?: CICDServer }) => (
  <PipelineCardWrapper
    to={`/inventory/pipelines/cicd-servers/${encodeURIComponent(cicdServer.serverUrl)}`}>
    <Header>
      <CardTitle>
        <TitleWrapper>
          <ClampText>{cicdServer.serverUrl}</ClampText>
        </TitleWrapper>
      </CardTitle>
    </Header>
    <Widgets>
      <PipelineAvatarWidget statName="Technology" vendor={cicdServer.cicdTechnology} />
      <PipelineStatWidget statName="Pipelines" statValue={cicdServer.pipelinesCount} />
      <PipelineStatWidget statName="Dependencies" statValue={cicdServer.dependenciesCount} />
    </Widgets>
  </PipelineCardWrapper>
));
