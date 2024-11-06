import { observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import { ArtifactsPage } from '@src-v2/containers/pages/artifacts/artifacts-page';
import { ArtifactCard } from '@src-v2/containers/pages/artifacts/components/artifact-card';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject } from '@src-v2/hooks';

export default observer(() => {
  const { artifacts, rbac } = useInject();

  if (!rbac.canEdit(resourceTypes.Global)) {
    return <Redirect to="/" />;
  }

  return (
    <ArtifactsPage
      title="Artifacts"
      filterItemTypeDisplayName={{ singular: 'artifact', plural: 'artifacts' }}
      searchItemTypeDisplayName="artifacts"
      dataFetcher={artifacts.searchArtifacts}
      filterFetcher={artifacts.getArtifactsFilterOptions}
      cardToRender={ArtifactCard}
    />
  );
});
