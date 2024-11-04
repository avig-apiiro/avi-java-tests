import { useMemo } from 'react';
import { SimpleTextCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { ExternalLink } from '@src-v2/components/typography';
import { getRepository } from '@src-v2/containers/inventory-table/inventory-utils';
import { generateCodeReferenceUrl } from '@src-v2/data/connectors';
import { InventoryElementCollectionRow } from '@src-v2/types/inventory-elements/inventory-element-collection-row';
import { RbacRoleElement, RbacType } from '@src-v2/types/inventory-elements/rbac-role-element';
import {
  ApiCodeReference,
  CodeReference,
  NamedCodeReference,
} from '@src-v2/types/risks/code-reference';
import { StubAny } from '@src-v2/types/stub-any';
import { Column } from '@src-v2/types/table';

export function createRbacRoleColumns(profile: any): Column<StubAny>[] {
  return [
    {
      key: 'name-column',
      label: 'Name',
      resizeable: true,
      Cell: ({ data, ...props }) => (
        <SimpleTextCell {...props}>{data.diffableEntity.name}</SimpleTextCell>
      ),
    },
    {
      key: 'swagger-column',
      label: 'Swagger definition',
      Cell: ({ data, ...props }) => (
        <RbacTypeCell {...props} data={data} profile={profile} rbacType="Swagger" />
      ),
    },
    {
      key: 'method-authorization-column',
      label: 'Method annotation',
      Cell: ({ data, ...props }) => (
        <RbacTypeCell
          {...props}
          data={data}
          profile={profile}
          rbacType="MethodAuthorization"
          itemToString={(usage: ApiCodeReference) => usage.methodName}
        />
      ),
    },
    {
      key: 'security-configuration-column',
      label: 'Security configuration',
      Cell: ({ data, ...props }) => (
        <RbacTypeCell {...props} data={data} profile={profile} rbacType="SecurityConfiguration" />
      ),
    },
  ];
}

function RbacTypeCell({
  data,
  rbacType,
  profile,
  itemToString = (usage: NamedCodeReference) => usage.name,
  ...props
}: {
  data: InventoryElementCollectionRow<RbacRoleElement>;
  rbacType: RbacType;
  profile: any;
  itemToString?: (usage: CodeReference) => string;
}) {
  const repository = useMemo(() => getRepository({ profile, data }), [profile, data]);
  const indicationUsages = useMemo(() => {
    return data.diffableEntity.usageIndications
      .filter(indication => indication.rbacType === rbacType)
      .flatMap(indication => indication.usages);
  }, [data, rbacType]);

  return (
    <TrimmedCollectionCell
      {...props}
      item={({ value }) => (
        <ExternalLink href={generateCodeReferenceUrl(repository, value)}>
          {itemToString(value)}
        </ExternalLink>
      )}>
      {indicationUsages}
    </TrimmedCollectionCell>
  );
}
