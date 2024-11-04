import { HierarchyPointNode } from 'd3-hierarchy';
import _ from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Point } from 'react-d3-tree/lib/types/types/common';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  AnalyticsLayer,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { CircleButton } from '@src-v2/components/button-v2';
import { Divider } from '@src-v2/components/divider';
import { SvgIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Caption1 } from '@src-v2/components/typography';
import { Tree } from '@src-v2/containers/entity-pane/exposure-path/d3-tree';
import { ExposurePathNode } from '@src-v2/containers/entity-pane/exposure-path/exposure-path-node';
import { NodePopover } from '@src-v2/containers/entity-pane/exposure-path/node-popover';
import {
  renderDotsPatternToSvg,
  updateDotsPatternDimensions,
} from '@src-v2/containers/entity-pane/exposure-path/svg-dots-background-pattern';
import { ExposurePathNodeType, ExposurePathResponse } from '@src-v2/types/exposure-path';
import { fromRem } from '@src-v2/utils/style-utils';

const nodeWidth = fromRem(34, false) as number;
const nodeHeight = fromRem(24, false) as number;
const horizontalSpacing = fromRem(10, false) as number;
const verticalSpacing = fromRem(4.5, false) as number;
const nodeIconHeight = fromRem(4.5, false) as number;
const canvasHeight = fromRem(102, false) as number;
const minZoom = 0.5;
const maxZoom = 5;
const zoomStepIncrement = 0.2;
const nodeFocusZoom = 1.5;

type TreeDepth = {
  verticalNodesCount: number;
  horizontalNodesCount: number;
};

const ExposurePath = ({ exposurePath, canvasWidth }) => {
  const prevCanvasWidth = useRef(canvasWidth);
  const trackAnalytics = useTrackAnalytics();
  const [showZoomHint, setShowZoomHint] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [popoverNode, setPopoverNode] = useState<HierarchyPointNode<ExposurePathNodeType>>(null);

  const [treeRoots, treeDepth, initialTranslate, initialZoom] = useMemo(() => {
    const treeRoots = transformExposurePathToTreeRoots(exposurePath);
    const treeDepth = calculateTreeDepths(treeRoots);
    const initialZoom = calculateInitialZoom(canvasWidth, canvasHeight, treeDepth);
    const initialTranslate = calculateTranslate(
      getTreeDimensions(treeDepth, initialZoom).width,
      canvasWidth,
      initialZoom
    );

    return [treeRoots, treeDepth, initialTranslate, initialZoom];
  }, [exposurePath, canvasWidth]);

  const [currentZoom, setCurrentZoom] = useState(initialZoom);
  const [canZoom, setCanZoom] = useState(false);
  const [translate, setTranslate] = useState<Point>(initialTranslate);

  useEffect(() => {
    const listener = event => {
      const CTRL_KEY = 17;
      const CMD_KEY = 91;

      setCanZoom((event.metaKey || event.ctrlKey) && [CTRL_KEY, CMD_KEY].indexOf(event.which) > -1);
      if ([CTRL_KEY, CMD_KEY].indexOf(event.which) > -1) {
        setShowZoomHint(false);
      }
    };

    function setShowZoomHintListener() {
      setShowZoomHint(true);
    }

    document.addEventListener('scroll', setShowZoomHintListener, true);
    document.addEventListener('keydown', listener, true);
    document.addEventListener('keyup', listener, true);

    return () => {
      document.removeEventListener('keydown', listener);
      document.removeEventListener('keyup', listener);
      document.removeEventListener('scroll', setShowZoomHintListener);
    };
  }, []);

  useEffect(() => {
    const d3TreeSvgSelector = '.rd3t-svg';
    renderDotsPatternToSvg(d3TreeSvgSelector);
  }, []);

  const popoverOrientation = useMemo(
    () =>
      popoverNode &&
      translate.x + popoverNode.y * currentZoom + (nodeWidth * currentZoom) / 2 <
        canvasWidth - (fromRem(79, false) as number)
        ? 'right'
        : 'left',
    [translate, popoverNode?.y, currentZoom, canvasWidth]
  );

  useEffect(() => {
    const treeDimensions = getTreeDimensions(treeDepth, currentZoom);
    if (canvasWidth !== prevCanvasWidth.current) {
      setTranslate(calculateTranslate(treeDimensions.width, canvasWidth, currentZoom));
      prevCanvasWidth.current = canvasWidth;
    }
  }, [canvasWidth, currentZoom]);

  useEffect(() => {
    const nodeToPopover = hoveredItem || selectedNode;
    if (selectedNode !== nodeToPopover && nodeToPopover) {
      trackAnalytics(AnalyticsEventName.ActionClicked, {
        [AnalyticsDataField.ActionType]: 'Open node card',
        [AnalyticsDataField.ExposurePathNode]: nodeToPopover.data.title,
      });
    }
    setPopoverNode(nodeToPopover);
  }, [hoveredItem, selectedNode]);

  const onNodeFocus = useCallback(() => {
    if (!selectedNode) {
      return;
    }
    setCurrentZoom(nodeFocusZoom);
    setTranslate({
      x: canvasWidth / 2 - selectedNode.y * nodeFocusZoom - nodeWidth / 2,
      y: canvasHeight / 2 - selectedNode.x * nodeFocusZoom - nodeHeight / 2,
    });
    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.ActionType]: 'Focus on node',
    });
  }, [selectedNode]);

  return (
    <Container
      onMouseEnter={() => {
        setShowZoomHint(true);
      }}
      onMouseLeave={() => {
        setShowZoomHint(false);
      }}>
      {showZoomHint && (
        <ZoomDragInstructionsContainer>
          <ZoomDragInstructions>
            <Caption1>Use</Caption1>
            <SvgIcon name="Command" size={Size.XSMALL} />
            <Caption1> / Ctrl + scroll to zoom</Caption1>
          </ZoomDragInstructions>
        </ZoomDragInstructionsContainer>
      )}
      {_.first(_.first(popoverNode?.data?.propertiesSections)?.properties) && (
        <AnalyticsLayer
          analyticsData={
            selectedNode && {
              [AnalyticsDataField.ExposurePathNode]: selectedNode.title,
            }
          }>
          <NodePopover
            exposurePath={popoverNode.data}
            position={popoverOrientation}
            onUnpin={
              selectedNode &&
              (() => {
                setSelectedNode(null);
                trackAnalytics(AnalyticsEventName.ActionClicked, {
                  [AnalyticsDataField.ActionType]: 'Pin',
                  [AnalyticsDataField.ExposurePathNode]: selectedNode.title,
                });
              })
            }
          />
        </AnalyticsLayer>
      )}
      <ZoomControlsContainer>
        <ZoomControls>
          <CircleButton
            variant={Variant.SECONDARY}
            size={Size.SMALL}
            disabled={currentZoom >= maxZoom}
            onClick={() => {
              trackAnalytics(AnalyticsEventName.ActionClicked, {
                [AnalyticsDataField.ActionType]: 'Zoom in',
              });
              setCurrentZoom(currentZoom + zoomStepIncrement);
            }}>
            <SvgIcon name="PlusSmall" />
          </CircleButton>
          <CircleButton
            variant={Variant.SECONDARY}
            size={Size.SMALL}
            disabled={currentZoom <= minZoom}
            onClick={() => {
              trackAnalytics(AnalyticsEventName.ActionClicked, {
                [AnalyticsDataField.ActionType]: 'Zoom out',
              });
              setCurrentZoom(currentZoom - zoomStepIncrement);
            }}>
            <SvgIcon name="MinusSmall" />
          </CircleButton>
          <Divider />
          <CircleButton
            variant={Variant.SECONDARY}
            size={Size.SMALL}
            disabled={!selectedNode}
            onClick={onNodeFocus}>
            <SvgIcon name="NodeFocus" />
          </CircleButton>
          <CircleButton
            variant={Variant.SECONDARY}
            size={Size.SMALL}
            onClick={() => {
              setTranslate(initialTranslate);
              setCurrentZoom(initialZoom);
              trackAnalytics(AnalyticsEventName.ActionClicked, {
                [AnalyticsDataField.ActionType]: 'Graph overview',
              });
            }}>
            <SvgIcon name="FullScreen" />
          </CircleButton>
        </ZoomControls>
      </ZoomControlsContainer>
      <Tree
        data={treeRoots[0]}
        onUpdate={({ zoom, translate: newTranslate }) => {
          if (zoom !== currentZoom || newTranslate !== translate) {
            updateDotsPatternDimensions(newTranslate, zoom);
            setCurrentZoom(zoom);
            setTranslate(newTranslate);
            setShowZoomHint(false);
          }
        }}
        translate={translate}
        zoom={currentZoom}
        scaleExtent={{
          min: minZoom,
          max: maxZoom,
        }}
        zoomable={canZoom}
        onNodeClick={node => {
          if ((node?.data as unknown as ExposurePathNodeType)?.key !== selectedNode?.data?.key) {
            setSelectedNode(node);
          } else {
            setSelectedNode(null);
            setHoveredItem(null);
          }
        }}
        onNodeMouseOver={setHoveredItem}
        onNodeMouseOut={() => {
          setHoveredItem(null);
        }}
        nodeSize={{
          x: nodeWidth + horizontalSpacing,
          y: nodeHeight + verticalSpacing,
        }}
        renderCustomNodeElement={({ nodeDatum, onNodeClick, onNodeMouseOver, onNodeMouseOut }) => {
          const node = nodeDatum as unknown as ExposurePathNodeType;
          return (
            <AnalyticsLayer
              analyticsData={{
                [AnalyticsDataField.ExposurePathNode]: node.title,
              }}>
              <ExposurePathNode
                nodeDatum={node}
                onNodeClick={onNodeClick}
                selectedNode={selectedNode}
                onNodeMouseOver={onNodeMouseOver}
                onNodeMouseOut={onNodeMouseOut}
                nodeWidth={nodeWidth}
                nodeHeight={nodeHeight}
                nodeIconHeight={nodeIconHeight}
              />
            </AnalyticsLayer>
          );
        }}
      />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

const ZoomControlsContainer = styled.div`
  position: absolute;
  bottom: 0;
  padding: 4rem;
  z-index: 2;
`;

const ZoomControls = styled.div`
  width: 8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
  border-radius: 100vmax;
  box-shadow: var(--elevation-0);
  background-color: var(--color-white);

  ${Divider} {
    margin: unset !important;
  }
`;

const calculateTreeDepths = (treeRoots: HierarchyPointNode<ExposurePathNodeType>[]): TreeDepth => {
  const getHeight = (array: HierarchyPointNode<ExposurePathNodeType>[]) => {
    return 1 + Math.max(0, ...array.map(({ children = [] }) => getHeight(children)));
  };
  const getLeafNodes = (
    nodes: HierarchyPointNode<ExposurePathNodeType>[],
    result: HierarchyPointNode<ExposurePathNodeType>[] = []
  ) => {
    for (let i = 0, { length } = nodes; i < length; i++) {
      if (!nodes[i].children || nodes[i].children.length === 0) {
        result.push(nodes[i]);
      } else {
        result = getLeafNodes(nodes[i].children, result);
      }
    }
    return result;
  };

  return {
    verticalNodesCount: getLeafNodes(treeRoots).length,
    horizontalNodesCount: getHeight(treeRoots) - 1,
  };
};

const getTreeDimensions = (treeDepth: TreeDepth, zoom: number) => {
  const spacersWidth = (treeDepth.horizontalNodesCount - 1) * horizontalSpacing;
  const spacersHeight = nodeHeight + (treeDepth.horizontalNodesCount - 1) * verticalSpacing;
  const nodesWidth = treeDepth.horizontalNodesCount * nodeWidth;
  const nodesHeight = treeDepth.verticalNodesCount * nodeHeight;

  return {
    width: (nodesWidth + spacersWidth) * zoom,
    height: (nodesHeight + spacersHeight) * zoom,
  };
};

const calculateInitialZoom = (
  canvasWidth: number,
  canvasHeight: number,
  treeDepth: TreeDepth
): number => {
  const treeDimensions = getTreeDimensions(treeDepth, 1);

  const canvasWidthNoPadding = canvasWidth - (fromRem(14, false) as number);
  const canvasHeightNoPadding = canvasHeight - (fromRem(7, false) as number);

  const canvasWidthRatio = 1 + (canvasWidth / 914 - 1) / 2;

  return _.min([
    canvasWidthRatio,
    canvasHeightNoPadding / treeDimensions.height,
    canvasWidthNoPadding / treeDimensions.width,
  ]);
};

const calculateTranslate = (
  calculatedTreeWidth: number,
  canvasWidth: number,
  zoom: number
): Point => {
  return {
    x:
      calculatedTreeWidth + (fromRem(14, false) as number) >= canvasWidth
        ? (fromRem(7, false) as number) + (nodeWidth * zoom) / 2
        : (nodeWidth * zoom) / 2 + canvasWidth / 2 - calculatedTreeWidth / 2,
    y: nodeIconHeight * zoom - (nodeHeight * zoom) / 2 + canvasHeight / 2,
  };
};

const transformExposurePathToTreeRoots = (exposurePath: ExposurePathResponse) => {
  const linksByFromKey = _.groupBy(exposurePath.links, link => link.fromNodeKey);
  const nodes = _.map(exposurePath.nodes, node => ({ ...node }));
  const nodesByKey = _.groupBy(nodes, node => node.key);
  const toNodeKeys = _.map(exposurePath.links, link => link.toNodeKey);
  const treeRoots = [];
  _.forEach(nodes, node => {
    node.children = _.map(linksByFromKey[node.key] || [], link => {
      return nodesByKey[link.toNodeKey][0];
    });
    if (toNodeKeys.indexOf(node.key) === -1) {
      treeRoots.push(node);
    }
  });
  return treeRoots;
};

const ZoomDragInstructionsContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const ZoomDragInstructions = styled.div`
  width: 48rem;
  height: 9rem;
  display: flex;
  padding: 2rem 3rem;
  background-color: var(--color-blue-gray-20);
  border-radius: 1rem;
  position: absolute;
  bottom: 81rem;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  transition: transform 200ms;
  z-index: 2;
`;

export { ExposurePath };
