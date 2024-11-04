import { ClampText } from '@src-v2/components/clamp-text';
import { Table } from '@src-v2/components/table/table';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { StubAny } from '@src-v2/types/stub-any';
import { Column } from '@src-v2/types/table';

const DEFAULT_ROUTE = '/**';

export const securityConfigurationColumns: Column<StubAny>[] = [
  {
    key: 'class-name-column',
    label: 'Class Name',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <Tooltip content={data.diffableEntity.entityId}>
          <ClampText withTooltip={false}>{data.diffableEntity.codeReference.name}</ClampText>
        </Tooltip>
      </Table.Cell>
    ),
  },
  {
    key: 'paths-column',
    label: 'Paths',
    resizeable: true,
    Cell: ({ data, ...props }) => {
      const paths: string[] = [
        ...(data.diffableEntity.mainMatchers?.flatMap((matcher: StubAny) => matcher.patterns) ??
          []),
        ...(data.diffableEntity.subMatchers?.flatMap((matcher: StubAny) =>
          matcher.patterns.filter((pattern: StubAny) => pattern !== DEFAULT_ROUTE)
        ) ?? []),
      ];

      return <TrimmedCollectionCell {...props}>{paths}</TrimmedCollectionCell>;
    },
  },
  {
    key: 'security-configurations-column',
    label: 'Security configurations',
    resizeable: true,
    Cell: ({ data, ...props }) => {
      const mechanisms: string[] = [
        ...data.diffableEntity.securityMechanisms?.map(
          (mechanism: StubAny) =>
            mechanismTranslations[mechanism as keyof typeof mechanismTranslations] ?? mechanism
        ),
        ...data.diffableEntity.filters?.map((filter: StubAny) => `Custom filter: ${filter}`),
      ];

      return <TrimmedCollectionCell {...props}>{mechanisms}</TrimmedCollectionCell>;
    },
  },
];

const mechanismTranslations = {
  HTTP_BASIC: 'HTTP Basic Authentication',
  CSRF: 'CSRF Protection',
  RBAC: 'Role-Based Authorization',
  JWT: 'JWT Authentication',
};
