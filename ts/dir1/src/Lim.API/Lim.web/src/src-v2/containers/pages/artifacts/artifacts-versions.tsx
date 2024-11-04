import styled from 'styled-components';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { ClampText } from '@src-v2/components/clamp-text';
import { VendorIcon } from '@src-v2/components/icons';
import { Table } from '@src-v2/components/table/table';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { ArtifactsTable } from '@src-v2/containers/pages/artifacts/artifacts-table';
import { getProviderDisplayName } from '@src-v2/data/providers';
import { useInject } from '@src-v2/hooks';
import { ArtifactVersion } from '@src-v2/types/artifacts/artifacts-types';

export const ArtifactsVersions = () => {
  const { artifacts } = useInject();
  return (
    <AnalyticsLayer
      analyticsData={{ [AnalyticsDataField.Context]: 'artifacts-dependencies-table' }}>
      <ArtifactsTable
        tableColumns={artifactsVersionsTableColumns}
        filterFetcher={artifacts.getArtifactVersionsFilterOptions}
        dataFetcher={artifacts.getArtifactVersions}
        itemTypeDisplayName={{ singular: 'version', plural: 'versions' }}
        searchPlaceholder="Search by digest..."
      />
    </AnalyticsLayer>
  );
};

export const artifactsVersionsTableColumns = [
  {
    label: 'Image ID',
    Cell: ({ data, ...props }: { data: ArtifactVersion }) => (
      <Table.FlexCell {...props}>
        <ClampText>{data.imageIdentification.imageId}</ClampText>
      </Table.FlexCell>
    ),
  },
  {
    label: 'Repo digests',
    Cell: ({ data, ...props }: { data: ArtifactVersion }) => (
      <TrimmedCollectionCell {...props}>
        {data.imageIdentification?.repoDigests}
      </TrimmedCollectionCell>
    ),
  },
  {
    label: 'Repo tags',
    Cell: ({ data, ...props }: { data: ArtifactVersion }) => (
      <TrimmedCollectionCell {...props}>{data.imageIdentification?.repoTags}</TrimmedCollectionCell>
    ),
  },
  {
    label: 'Source',
    Cell: ({ data, ...props }: { data: ArtifactVersion }) => (
      <Table.Cell {...props}>
        <ArtifactVersionSourceContainer {...props}>
          {data.sources?.map(provider => (
            <Tooltip key={provider} content={getProviderDisplayName(provider)}>
              <VendorIcon name={provider} />
            </Tooltip>
          ))}
        </ArtifactVersionSourceContainer>
      </Table.Cell>
    ),
    width: '25rem',
  },
];

const ArtifactVersionSourceContainer = styled.div`
  display: flex;
  gap: 1rem;
`;
