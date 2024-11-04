import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { ClampText } from '@src-v2/components/clamp-text';
import { ConditionalPackageIcon, SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { Table } from '@src-v2/components/table/table';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { ArtifactsTable } from '@src-v2/containers/pages/artifacts/artifacts-table';
import { useInject } from '@src-v2/hooks';
import { ArtifactDependency } from '@src-v2/types/artifacts/artifacts-types';

export const ArtifactsDependencies = () => {
  const { artifacts } = useInject();
  return (
    <AnalyticsLayer
      analyticsData={{ [AnalyticsDataField.Context]: 'artifacts-dependencies-table' }}>
      <ArtifactsTable
        tableColumns={artifactsDependenciesTableColumns}
        filterFetcher={artifacts.getArtifactDependenciesFilterOptions}
        dataFetcher={artifacts.getArtifactDependencies}
        itemTypeDisplayName={{ singular: 'dependency', plural: 'dependencies' }}
        searchPlaceholder="Search by dependency name..."
      />
    </AnalyticsLayer>
  );
};

export const artifactsDependenciesTableColumns = [
  {
    label: 'Name',
    Cell: ({ data, ...props }: { data: ArtifactDependency }) => (
      <Table.FlexCell {...props}>
        <ClampText>{data.dependencyName}</ClampText>
      </Table.FlexCell>
    ),
  },
  {
    label: 'Dependency version',
    Cell: ({ data, ...props }: { data: ArtifactDependency }) => {
      return (
        <Table.FlexCell {...props}>
          <ClampText>{data.dependencyVersion}</ClampText>
        </Table.FlexCell>
      );
    },
  },
  {
    label: 'Package manager',
    Cell: ({ data, ...props }: { data: ArtifactDependency }) => (
      <Table.Cell {...props}>
        <Tooltip content={data.packageManager.name}>
          <ConditionalPackageIcon
            name={data.packageManager.name}
            size={Size.SMALL}
            fallback={<SvgIcon name="Unknown" size={Size.SMALL} />}
          />
        </Tooltip>
      </Table.Cell>
    ),
    width: '15rem',
  },
  {
    label: 'Artifact version',
    Cell: ({ data, ...props }: { data: ArtifactDependency }) => (
      <TrimmedCollectionCell {...props}>
        {data.artifactImageIdentifications.map(
          artifactImageIdentification => artifactImageIdentification.repoTags
        )}
      </TrimmedCollectionCell>
    ),
    width: '25rem',
  },
  {
    label: 'Source',
    Cell: ({ data, ...props }: { data: ArtifactDependency }) => (
      <Table.Cell {...props}>
        {data.sources?.map((source: string) => <VendorIcon name={source} />)}
      </Table.Cell>
    ),
    width: '15rem',
  },
];
