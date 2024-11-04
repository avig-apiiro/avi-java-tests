import compact from 'lodash/compact';
import { observer } from 'mobx-react';
import { Redirect, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { VendorCircle } from '@src-v2/components/circles';
import { Gutters } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { StickyHeader } from '@src-v2/components/layout/sticky-header';
import { Size } from '@src-v2/components/types/enums/size';
import { PipelineInventoryPage } from '@src-v2/containers/pages/pipelines/cicd-pipelines/pipeline-inventory-page';
import { PipelinesRisksTable } from '@src-v2/containers/pages/pipelines/cicd-pipelines/pipelines-risks';
import { pipelinesRisksTableColumns } from '@src-v2/containers/pages/pipelines/cicd-pipelines/pipelines-risks-table-content';
import { RisksContext, TableRiskType } from '@src-v2/containers/risks/risks-context';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject } from '@src-v2/hooks';
import { useSuspense } from '@src-v2/hooks/react-helpers/use-suspense';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export default observer(() => {
  const { pipelines, rbac, supplyChainRisks, application } = useInject();
  const { pipelineKey } = useParams<{ pipelineKey: string }>();
  const pipeline = useSuspense(pipelines.getPipeline, { key: pipelineKey });
  const { path: basePath, url: baseUrl } = useRouteMatch();

  if (!rbac.canEdit(resourceTypes.Global)) {
    return <Redirect to="/" />;
  }

  return (
    <Page title={pipeline.id}>
      <StickyHeader
        title={
          <TitleWrapper>
            <VendorCircle name={pipeline.cicdTechnology} size={Size.XXLARGE} /> {pipeline.id}
          </TitleWrapper>
        }
        navigation={compact([
          application.isFeatureEnabled(FeatureFlag.PipelinesRisksTable) && {
            label: 'Risk',
            to: 'risks',
          },
          { label: 'Inventory', to: 'inventory' },
        ]).filter(Boolean)}
      />

      <Switch>
        {application.isFeatureEnabled(FeatureFlag.PipelinesRisksTable) && (
          <Route path={`${basePath}/risks`}>
            <Gutters>
              <RisksContext
                risksService={supplyChainRisks}
                title="Pipelines risks"
                tableColumns={pipelinesRisksTableColumns}
                tableRiskType={TableRiskType.SupplyChain}>
                <PipelinesRisksTable />
              </RisksContext>
            </Gutters>
          </Route>
        )}
        <Route path={`${basePath}/inventory`}>
          <Gutters>
            <PipelineInventoryPage />
          </Gutters>
        </Route>
        risks
        <Redirect
          to={
            application.isFeatureEnabled(FeatureFlag.PipelinesRisksTable)
              ? `${baseUrl}/risks`
              : `${baseUrl}/inventory`
          }
        />
      </Switch>
    </Page>
  );
});

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;
