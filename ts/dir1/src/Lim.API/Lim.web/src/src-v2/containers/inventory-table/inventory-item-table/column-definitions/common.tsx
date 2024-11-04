import { ClampPath, ClampText } from '@src-v2/components/clamp-text';
import { DoubleLinedCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';

export function EntityNameCell({ data, ...props }) {
  return (
    <DoubleLinedCell {...props}>
      <ClampPath>
        {data.diffableEntity.codeReference?.relativeFilePath ??
          data.diffableEntity.codeReferences?.[0]?.relativeFilePath}
      </ClampPath>
      <ClampText>{data.diffableEntity.name}</ClampText>
    </DoubleLinedCell>
  );
}
