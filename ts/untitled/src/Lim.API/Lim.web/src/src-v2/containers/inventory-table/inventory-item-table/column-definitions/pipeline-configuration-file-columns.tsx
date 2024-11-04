import { ClampText } from '@src-v2/components/clamp-text';
import { VendorIcon } from '@src-v2/components/icons';
import { SimpleTextCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { InventoryInsightsCell } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions/inventory-insights-cell';
import { hasVendorIcon } from '@src-v2/data/icons';
import { humanize } from '@src-v2/utils/string-utils';
import { Table } from '@src/src-v2/components/table/table';

export const pipelineConfigurationFileColumns = [
  {
    key: 'id-column',
    label: 'Pipeline',
    width: '110rem',
    resizeable: true,
    Cell: ({ data, ...props }) => {
      const technology = data.diffableEntity.iacFramework;
      return hasVendorIcon(technology) ? (
        <Table.FlexCell {...props}>
          <Tooltip content={humanize(technology)}>
            <VendorIcon name={technology} />
          </Tooltip>
          <ClampText>{data.diffableEntity.id}</ClampText>
        </Table.FlexCell>
      ) : (
        <SimpleTextCell {...props}>
          {`${humanize(technology)} ${data.diffableEntity.id}`}
        </SimpleTextCell>
      );
    },
  },

  {
    key: 'filename-column',
    label: 'File name',
    resizeable: true,
    Cell: ({ data, ...props }) => {
      const relativeFilePath =
        data.diffableEntity.codeReference?.relativeFilePath ??
        data.diffableEntity.codeReferences[0]?.relativeFilePath;
      return (
        <SimpleTextCell {...props}>{relativeFilePath?.split(/([\\/])/g).pop()}</SimpleTextCell>
      );
    },
  },
  {
    key: 'insights-column',
    label: 'Insights',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <InventoryInsightsCell insights={data.diffableEntity.insights} {...props} />
    ),
  },
];
