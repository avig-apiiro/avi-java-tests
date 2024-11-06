import { TextButton } from '@src-v2/components/button-v2';
import { SeverityTag } from '@src-v2/components/tags';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { pluralFormat } from '@src-v2/utils/number-utils';
import { humanize } from '@src-v2/utils/string-utils';

export const SlaTag = ({
  severity,
  value,
  affectedBy,
}: {
  severity: string;
  value: number | null;
  affectedBy?: string;
}) => (
  <Tooltip
    interactive
    content={
      <>
        {humanize(severity)}:{' '}
        {value ? pluralFormat(value, 'day', undefined, true) : 'SLA is not defined'}
        {affectedBy && (
          <>
            <br />
            Affected by <TextButton to="/settings/general">{affectedBy}</TextButton>
          </>
        )}
      </>
    }>
    <SeverityTag riskLevel={value ? severity : null}>
      {severity[0].toUpperCase()}: {value ?? '--'}
    </SeverityTag>
  </Tooltip>
);
