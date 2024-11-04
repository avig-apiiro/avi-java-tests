import { HierarchyPointNode } from 'd3-hierarchy';
import _ from 'lodash';
import { useMemo, useState } from 'react';
import { SyntheticEventHandler } from 'react-d3-tree';
import styled from 'styled-components';
import { CircleIcon } from '@src-v2/components/circle-icon';
import { ClampText } from '@src-v2/components/clamp-text';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Caption1, Caption2 } from '@src-v2/components/typography';
import { NodeToElementIcon } from '@src-v2/containers/entity-pane/exposure-path/element-icon';
import { ExposurePathActions } from '@src-v2/containers/entity-pane/exposure-path/exposure-path-actions';
import { ExposurePathNodeType } from '@src-v2/types/exposure-path';
import { fromRem } from '@src-v2/utils/style-utils';

interface ExposurePathNodeProps {
  nodeDatum: ExposurePathNodeType;
  onNodeClick: SyntheticEventHandler;
  onNodeMouseOver: SyntheticEventHandler;
  onNodeMouseOut: SyntheticEventHandler;
  selectedNode: HierarchyPointNode<ExposurePathNodeType>;
  nodeWidth: number;
  nodeHeight: number;
  nodeIconHeight: number;
}

export const ExposurePathNode = (props: ExposurePathNodeProps) => {
  const { nodeDatum } = props;

  switch (nodeDatum.type) {
    case 'Unknown':
      return <UnknownNode {...props} />;
    default:
      return <DefaultNode {...props} />;
  }
};

const UnknownNode = ({ nodeDatum }: ExposurePathNodeProps) => (
  <foreignObject x="-0.5rem" y="-2rem" width="4rem" height="4rem">
    <UnknownNodeTooltip content="Expected connection to container can't be verified">
      <UnknownIcon name={nodeDatum.type} size={Size.XXSMALL} />
    </UnknownNodeTooltip>
  </foreignObject>
);

const DefaultNode = ({
  nodeDatum,
  onNodeClick,
  onNodeMouseOver,
  onNodeMouseOut,
  selectedNode,
  nodeWidth,
  nodeIconHeight,
}: ExposurePathNodeProps) => {
  const [isActionsOpened, setIsActionsOpened] = useState(false);
  const [isContainerHovered, setIsContainerHovered] = useState(false);
  const [isSelected] = useMemo(() => {
    return [selectedNode?.data.key === nodeDatum?.key] as const;
  }, [selectedNode, nodeDatum]);

  return (
    <foreignObject
      x={-nodeWidth / 2}
      y={-nodeIconHeight}
      width={fromRem(34, false)}
      height={fromRem(24, false)}>
      <Container
        onMouseEnter={() => {
          setIsContainerHovered(true);
        }}
        onMouseLeave={() => {
          setIsContainerHovered(false);
        }}>
        <IconBox>
          {(isContainerHovered || isActionsOpened) && !_.isEmpty(nodeDatum?.actions) && (
            <NodeActionsContainer>
              <HidePathUnderActions />
              <ExposurePathActions
                nodeDatum={nodeDatum}
                onShow={() => setIsActionsOpened(true)}
                onHide={() => setIsActionsOpened(false)}
              />
            </NodeActionsContainer>
          )}

          <div onClick={onNodeClick} onMouseEnter={onNodeMouseOver} onMouseLeave={onNodeMouseOut}>
            <NodeToElementIcon node={nodeDatum} selected={isSelected} />
          </div>
        </IconBox>
        <TextBox>
          <Caption1>
            <ClampText>{nodeDatum.title}</ClampText>
          </Caption1>
          <Caption2>
            <ClampText lines={2} withTooltip={false}>
              {nodeDatum.subtitle}
            </ClampText>
          </Caption2>
        </TextBox>
      </Container>
    </foreignObject>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: default;
`;

const TextBox = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  max-width: 30rem;

  ${Caption2} {
    color: var(--color-blue-gray-55);
    line-height: 3.5rem;
  }
`;

const NodeActionsContainer = styled.div`
  position: absolute;
  left: -7rem;

  ${CircleIcon} {
    border-color: var(--color-blue-gray-30);

    ${BaseIcon} {
      color: var(--color-blue-gray-50);
    }
  }
`;

const HidePathUnderActions = styled.div`
  background-color: white;
  position: absolute;
  width: 7rem;
  z-index: -1;
  height: 8rem;
`;

const IconBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const UnknownIcon = styled(SvgIcon)`
  display: flex;
  color: var(--color-blue-gray-50);
  &:hover {
    cursor: default;
  }
`;

const UnknownNodeTooltip = styled(Tooltip)`
  width: 48rem;
`;
