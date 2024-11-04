import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { LinkMode, TextButton } from '@src-v2/components/button-v2';
import { SvgIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Artifact } from '@src-v2/types/artifacts/artifacts-types';
import { StyledProps } from '@src-v2/types/styled';
import { stopPropagation } from '@src-v2/utils/dom-utils';

export function ArtifactExplorerTableView({
  artifactMultiSourcedEntity,
}: StyledProps<{
  artifactMultiSourcedEntity: Artifact;
  isActive?: boolean;
  showArchivedIndicator?: boolean;
  monitorStatus?: string;
  ignoredBy?: string;
  ignoreReason?: string;
  lastMonitoringChangeTimestamp?: string;
}>) {
  const history = useHistory();
  if (!artifactMultiSourcedEntity) {
    return <></>;
  }
  return (
    <>
      <IconWrapper name="ContainerImage" size={Size.XSMALL} />
      <ContainerImageButton
        mode={LinkMode.INTERNAL}
        underline={Boolean(artifactMultiSourcedEntity.key)}
        size={Size.XSMALL}
        onClick={e => {
          if (artifactMultiSourcedEntity.key) {
            history.push(`/inventory/artifacts/${artifactMultiSourcedEntity.key}/risks`);
          }
          stopPropagation(e);
        }}>
        {artifactMultiSourcedEntity.displayName}
      </ContainerImageButton>
    </>
  );
}

const ContainerImageButton = styled(TextButton)`
  cursor: ${props => (props.underline ? 'pointer' : 'default')};
`;

const IconWrapper = styled(SvgIcon)`
  color: var(--color-blue-gray-50);
`;
