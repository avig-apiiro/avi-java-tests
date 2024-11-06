import { DiffableEntityPane } from '@src-v2/components/entity-pane/diffable-entity/diffable-entity-pane';
import { PaneProps } from '@src-v2/components/panes/pane';
import { AboutThisProtobufMessage } from '@src-v2/containers/entity-pane/protobuf-schema/about-this-protobuf-message';
import { AboutThisProtobufService } from '@src-v2/containers/entity-pane/protobuf-schema/about-this-protobuf-service';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { ProtobufEntityReference } from '@src-v2/types/data-model-reference/protobuf-entity-reference';
import { isTypeOf } from '@src-v2/utils/ts-utils';

export function ProtobufSchemaEntityPane({
  dataModelReference,
  ...props
}: { dataModelReference: DiffableEntityDataModelReference } & PaneProps) {
  if (!isTypeOf<ProtobufEntityReference>(dataModelReference, 'diffableEntityObjectType')) {
    throw new Error(
      `Invalid data model reference, expected ProtobufEntityReference, but received: ${JSON.stringify(
        dataModelReference
      )}`
    );
  }

  return (
    <DiffableEntityPane dataModelReference={dataModelReference} {...props}>
      {childProps => (
        <>
          {dataModelReference.diffableEntityObjectType === 'ProtobufMessage' ? (
            <AboutThisProtobufMessage {...childProps} />
          ) : (
            <AboutThisProtobufService {...childProps} />
          )}
        </>
      )}
    </DiffableEntityPane>
  );
}
