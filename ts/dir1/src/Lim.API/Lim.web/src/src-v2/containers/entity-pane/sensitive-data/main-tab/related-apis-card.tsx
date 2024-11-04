import _ from 'lodash';
import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Badge } from '@src-v2/components/badges';
import { Button, CircleButton, TextButton } from '@src-v2/components/button-v2';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { ClampText } from '@src-v2/components/clamp-text';
import { QuickFilters } from '@src-v2/components/filters/quick-filters';
import { SvgIcon } from '@src-v2/components/icons';
import { PlainPaneTable } from '@src-v2/components/panes/plain-pane-table';
import { CollapsibleTable } from '@src-v2/components/table/collapsible-table';
import { Table } from '@src-v2/components/table/table';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Paragraph } from '@src-v2/components/typography';
import { useSensitiveDataPaneContext } from '@src-v2/containers/entity-pane/sensitive-data/use-sensitive-data-pane-context';
import { generateCodeReferenceUrl } from '@src-v2/data/connectors';
import { useInject } from '@src-v2/hooks';
import { useClientDataTable } from '@src-v2/hooks/use-client-data-table';
import { useTable } from '@src-v2/hooks/use-table';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { ApiReference } from '@src-v2/types/inventory-elements/sensitive-data-element';
import { Column } from '@src-v2/types/table';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { pluralFormat } from '@src-v2/utils/number-utils';

export enum QuickFiltersOptions {
  Exposed = 'exposed',
  Involved = 'involved',
}

export const RelatedApisCard = ({ ...props }: ControlledCardProps) => {
  const { application } = useInject();
  const { element } = useSensitiveDataPaneContext();
  const { exposingApiReferences, involvingApiReferences } = element;

  const [selectedFilter, setSelectedFilter] = useState<QuickFiltersOptions>(
    exposingApiReferences?.length ? QuickFiltersOptions.Exposed : QuickFiltersOptions.Involved
  );

  const isSmartTableOnRiskPaneEnabled = application.isFeatureEnabled(
    FeatureFlag.SmartTableOnRiskPane
  );

  const apisToRender: ApiReference[] = useMemo(() => {
    switch (selectedFilter) {
      case QuickFiltersOptions.Exposed:
        return exposingApiReferences;
      case QuickFiltersOptions.Involved:
        return involvingApiReferences;
      default:
        return [];
    }
  }, [selectedFilter]);

  const dependencyFindingsWithKey = useMemo(
    () =>
      apisToRender.map(api => ({
        key: api.entityId,
        ...api,
      })),
    [apisToRender]
  );

  const tableModel = useTable({
    tableColumns,
    hasReorderColumns: false,
  });

  const clientTableModel = useClientDataTable<ApiReference & { key: string }>(
    dependencyFindingsWithKey,
    {
      key: 'apiReference',
      columns: tableColumns,
    }
  );

  if (!element.exposingApiReferences.length && !element.involvingApiReferences.length) {
    return null;
  }

  return (
    <ControlledCard
      {...props}
      title={`Related APIs (${involvingApiReferences.length + exposingApiReferences.length})`}>
      <Paragraph>
        This sensitive data is either directly exposed or indirectly involved in the API call flow
        of the following APIs:
      </Paragraph>

      <QuickFilters>
        <Button
          variant={Variant.FILTER}
          disabled={!exposingApiReferences.length}
          data-active={dataAttr(selectedFilter === QuickFiltersOptions.Exposed)}
          onClick={() => setSelectedFilter(QuickFiltersOptions.Exposed)}>
          Exposed in APIs &middot; {exposingApiReferences.length}
        </Button>
        <Button
          variant={Variant.FILTER}
          disabled={!involvingApiReferences.length}
          data-active={dataAttr(selectedFilter === QuickFiltersOptions.Involved)}
          onClick={() => setSelectedFilter(QuickFiltersOptions.Involved)}>
          Involved in APIs &middot; {involvingApiReferences.length}
        </Button>
      </QuickFilters>
      {isSmartTableOnRiskPaneEnabled ? (
        <PlainPaneTable
          dataModel={clientTableModel}
          itemName={pluralFormat(dependencyFindingsWithKey.length, 'Related API', 'Related APIs')}
        />
      ) : (
        <CollapsibleTable compactRowsNumber={5} tableModel={tableModel} items={apisToRender} />
      )}
    </ControlledCard>
  );
};

const tableColumns: Column<ApiReference>[] = [
  {
    key: 'related-api-module-column',
    label: 'Module',
    Cell: ({ data, ...props }) => {
      const { risk, relatedProfile } = useSensitiveDataPaneContext();

      if (!risk) {
        return <Table.FlexCell {...props} />;
      }

      const { profile } = risk;

      const [matchingModule = null] = _.orderBy(
        profile.modules.filter(module =>
          data.codeReference.relativeFilePath.startsWith(module.root)
        ),
        module => module?.root?.length
      ).slice(-1);

      return (
        <Table.FlexCell {...props}>
          {matchingModule && (
            <ModuleTextButton
              underline
              to={`module/${relatedProfile?.key}/${encodeURIComponent(
                matchingModule.root
              )}/inventory/components/apis`}
              size={Size.XXSMALL}>
              <ClampText>{matchingModule.name}</ClampText>
            </ModuleTextButton>
          )}
        </Table.FlexCell>
      );
    },
    width: '48rem',
  },
  {
    key: 'related-api-class-column',
    label: 'Class',
    Cell: ({ data, ...props }) => (
      <Table.FlexCell {...props}>
        <ClampText lines={2}>{data.codeReference?.className}</ClampText>
      </Table.FlexCell>
    ),
    width: '40rem',
  },
  {
    key: 'related-api-api-column',
    label: 'API',
    Cell: ({ data, ...props }) => (
      <Table.FlexCell {...props}>
        <>
          <Badge size={Size.XSMALL}>{data.httpMethod}</Badge>
          <ClampText>{data.httpRoute}</ClampText>
        </>
      </Table.FlexCell>
    ),
    width: '65rem',
  },
  {
    key: 'related-api-api-declaration-column',
    label: 'API declaration',
    Cell: ({ data, ...props }) => (
      <Table.FlexCell {...props}>
        <ApiDeclarationClampText>{data.codeReference?.methodSignature}</ApiDeclarationClampText>
      </Table.FlexCell>
    ),
    width: '37rem',
  },
  {
    key: 'related-api-code-column',
    label: 'Code',
    Cell: ({ data, ...props }) => (
      <Table.CenterCell {...props}>
        <CircleButton
          variant={Variant.FLOATING}
          href={generateCodeReferenceUrl(
            useSensitiveDataPaneContext().relatedProfile,
            data.codeReference
          )}>
          <SvgIcon name="Code" />
        </CircleButton>
      </Table.CenterCell>
    ),
    width: '15rem',
  },
];

const ModuleTextButton = styled(TextButton)`
  width: 100%;
`;

const ApiDeclarationClampText = styled(ClampText)`
  font-family: 'Courier Prime';
`;
