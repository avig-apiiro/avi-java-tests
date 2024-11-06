import { Fragment } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { LinkMode, TextButton } from '@src-v2/components/button-v2';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { Counter } from '@src-v2/components/counter';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { SvgIcon } from '@src-v2/components/icons';
import { usePaneState } from '@src-v2/components/panes/pane-context-provider';
import { Size } from '@src-v2/components/types/enums/size';
import { CardContentWrapper } from '@src-v2/containers/pages/artifacts/artifact-pane/components/common';
import { Finding } from '@src-v2/types/inventory-elements/lightweight-finding-response';

export const AboutAffectedAssetCard = ({
  finding,
  artifactKey,
  ...props
}: {
  finding: Partial<Finding>;
  artifactKey: string;
} & ControlledCardProps) => {
  const { packageName, packageVersions, artifactName, artifactImageIdentifications } = finding;
  const history = useHistory();
  const { closePane } = usePaneState();

  return (
    <ControlledCard {...props} title="Affected assets">
      <CardContentWrapper>
        <>
          {packageName && (
            <EvidenceLine isExtendedWidth label="Dependency">
              {packageName}
              {packageVersions.length > 0 ? `: ${packageVersions[0].trimEnd()}` : ''}
            </EvidenceLine>
          )}
          {Boolean(artifactName) && (
            <EvidenceLine isExtendedWidth label="Container image">
              <IconWrapper name="ContainerImage" size={Size.XSMALL} />
              <ContainerImageButton
                mode={artifactKey ? LinkMode.EXTERNAL : LinkMode.INTERNAL}
                underline={Boolean(artifactKey)}
                size={Size.XSMALL}
                onClick={() => {
                  if (artifactKey) {
                    history.push(`/inventory/artifacts/${artifactKey}/risks`);
                    closePane();
                  }
                }}>
                {artifactName}
              </ContainerImageButton>
            </EvidenceLine>
          )}
          {Boolean(artifactImageIdentifications?.length) && (
            <EvidenceLine isExtendedWidth label="Version identifiers">
              {artifactImageIdentifications.slice(0, 10).map((imageIdentification, index) => (
                <Fragment key={`${imageIdentification.imageId}-${index}`}>
                  {imageIdentification.imageId}
                  {index < 9 && index < artifactImageIdentifications.length - 1 && <>, </>}
                </Fragment>
              ))}
              {artifactImageIdentifications.length > 10 && (
                <Counter>+{artifactImageIdentifications.length - 10}</Counter>
              )}
            </EvidenceLine>
          )}
        </>
      </CardContentWrapper>
    </ControlledCard>
  );
};

const ContainerImageButton = styled(TextButton)`
  cursor: ${props => (props.underline ? 'pointer' : 'default')};
`;

const IconWrapper = styled(SvgIcon)`
  color: var(--color-blue-gray-50);
`;
