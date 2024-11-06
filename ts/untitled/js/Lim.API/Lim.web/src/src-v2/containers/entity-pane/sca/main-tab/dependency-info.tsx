import orderBy from 'lodash/orderBy';
import styled from 'styled-components';
import { Badge, BadgeColors } from '@src-v2/components/badges';
import { TextButton } from '@src-v2/components/button-v2';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { Collapsible, IconAlignment } from '@src-v2/components/collapsible';
import { SvgIcon } from '@src-v2/components/icons';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { SeverityTag } from '@src-v2/components/tags';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { useScaPaneContext } from '@src-v2/containers/entity-pane/sca/use-sca-pane-context';
import { useInject, useToggle } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import {
  DependencyInfo,
  DependencyInfoPath,
  DependencyInfoPathsSummary,
} from '@src-v2/types/inventory-elements';
import { UsedInCode } from '@src-v2/types/risks/risk-types/oss-risk-trigger-summary';
import { ScaDeclaredIn } from './sca-main-tab';

const DependencyInfoContent = ({
  orderedPath,
  topInfoPathIndex,
}: {
  orderedPath: DependencyInfo[];
  topInfoPathIndex: number;
}) => {
  const { risk, element } = useScaPaneContext();
  const arrWithoutTop = orderedPath.slice(1);
  const isLastDependencyTheSameLikeMain = orderedPath.at(-1).name === element.displayName;

  if (!isLastDependencyTheSameLikeMain) {
    arrWithoutTop.push(
      { name: '...', version: '' },
      {
        name: element.displayName,
        version: element.version,
      }
    );
  }

  return (
    <DependencyInfoContentWrapper>
      {arrWithoutTop.map((path, index) => (
        <DependencyInfoContentRowWrapper key={`${path.name}-${path.version}`} index={index + 1}>
          <DependencyInfoTreeBranch name="TreeBranch" size={Size.XSMALL} />
          <DependencyInfoPathWrapper key={`DependencyInfoPath-${topInfoPathIndex}${index}`}>
            {index === arrWithoutTop.length - 1 && (
              <DependencyInfoRiskIcon
                riskLevel={risk?.riskLevel.toString() || element.maxSeverity}
                size={Size.XSMALL}
              />
            )}
            {path.name}
            {path.version ? `: ${path.version}` : ''}
          </DependencyInfoPathWrapper>
        </DependencyInfoContentRowWrapper>
      ))}
    </DependencyInfoContentWrapper>
  );
};

const CollapsibleDependencyInfo = ({
  topInfoPathIndex,
  hasSameCodeReference,
  path,
  isDevDependency = false,
}: {
  topInfoPathIndex: number;
  hasSameCodeReference: boolean;
  path: DependencyInfoPath;
  isDevDependency: boolean;
}) => {
  const { application } = useInject();
  const { risk, relatedProfile } = useScaPaneContext();
  const { orderedPath, codeReference, usedInCodeStatus, usedInCodeReferences } = path;

  return (
    <DependencyInfoCollapsible
      key={`DependencyInfoIntroducedThrough-${topInfoPathIndex}`}
      title={
        <DependencyInfoTitle>
          {orderedPath[0].name}
          {orderedPath[0].version ? `:${orderedPath[0].version}` : ' '}
          {!hasSameCodeReference && (
            <ScaDeclaredIn
              codeReference={codeReference}
              relatedEntity={risk?.relatedEntity}
              label="(Declared in"
            />
          )}
          {isDevDependency && (
            <Tooltip content="Declared as a dev dependency in the manifest file">
              <Badge color={BadgeColors.Green} size={Size.XXSMALL}>
                Dev dependency
              </Badge>
            </Tooltip>
          )}
          {application.isFeatureEnabled(FeatureFlag.TopLevelUsedInCode) &&
            usedInCodeStatus === UsedInCode.Imported && (
              <Tooltip
                interactive
                disabled={!usedInCodeReferences?.length}
                content={
                  <>
                    This dependency is used in code in: <br />
                    <DependencyListItemContainer>
                      <CodeReferenceLink
                        codeReference={usedInCodeReferences?.[0]}
                        repository={relatedProfile}
                        lines={2}
                      />
                      <DependencyListItemMoreCount>
                        {usedInCodeReferences?.length - 1 > 0
                          ? `and ${usedInCodeReferences?.length - 1} more.`
                          : ''}
                      </DependencyListItemMoreCount>
                    </DependencyListItemContainer>
                  </>
                }>
                <SeverityTag size={Size.XXSMALL} riskLevel="high">
                  Used in code
                </SeverityTag>
              </Tooltip>
            )}
        </DependencyInfoTitle>
      }
      alignIcon={IconAlignment.Left}
      clickable={orderedPath.length > 1}>
      {orderedPath.slice(1).length > 0 && (
        <DependencyInfoContent orderedPath={orderedPath} topInfoPathIndex={topInfoPathIndex} />
      )}
    </DependencyInfoCollapsible>
  );
};

export const DependencyInfoIntroducedThrough = ({
  dependencyInfoPathsSummary,
}: {
  dependencyInfoPathsSummary: DependencyInfoPathsSummary;
}) => {
  const limitedDisplay = 3;
  const [showAll, toggleShowAll] = useToggle();
  const { topInfoPaths, hasSameCodeReference } = dependencyInfoPathsSummary;
  const isAtLeastOneNotDevDependency = topInfoPaths.some(path => !path.isDevDependency);

  return (
    <DependencyInfoIntroducedThroughWrapper>
      {orderBy(topInfoPaths, path => path.orderedPath.length, 'asc')
        .slice(0, showAll ? topInfoPaths.length : limitedDisplay)
        .map((topInfoPath, topInfoPathIndex) => (
          <CollapsibleDependencyInfo
            key={`DependencyInfoIntroducedThrough-${topInfoPathIndex}`}
            path={topInfoPath}
            topInfoPathIndex={topInfoPathIndex}
            hasSameCodeReference={hasSameCodeReference}
            isDevDependency={isAtLeastOneNotDevDependency && topInfoPath.isDevDependency}
          />
        ))}
      {topInfoPaths.length - limitedDisplay > 0 && (
        <TextButton onClick={toggleShowAll} underline>
          {!showAll && (
            <DependencyInfoMore>
              Show {topInfoPaths.length - limitedDisplay} more
            </DependencyInfoMore>
          )}
          {showAll && <DependencyInfoMore>Show less</DependencyInfoMore>}
        </TextButton>
      )}
    </DependencyInfoIntroducedThroughWrapper>
  );
};

const DependencyInfoTitle = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const DependencyInfoContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
  gap: 2rem;
`;

const DependencyInfoPathWrapper = styled.div`
  line-height: 5rem;
`;

const DependencyInfoContentRowWrapper = styled.div<{ index?: number }>`
  display: flex;
  padding-left: ${props => `${props.index * 30}px`};
  gap: 1rem;
`;

const DependencyInfoCollapsible = styled(({ clickable, children, ...props }) => (
  <Collapsible {...props}>{children}</Collapsible>
))`
  &[data-open] ${Collapsible.Head} > ${Collapsible.Chevron} {
    transform: ${props => (props.clickable ? 'rotate(90deg)' : 'none')};
  }

  ${Collapsible.Title} {
    font-size: var(--font-size-s);
    font-weight: 400;
    color: var(--color-blue-gray-70);
    margin-left: 1rem;
  }

  ${Collapsible.Head} {
    margin-bottom: 0;
    cursor: ${props => (props.clickable ? 'pointer' : 'default')};
  }

  ${Collapsible.Chevron} {
    transform: rotate(0deg);
  }
`;

const DependencyInfoIntroducedThroughWrapper = styled.div`
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const DependencyInfoTreeBranch = styled(SvgIcon)`
  color: var(--color-blue-gray-50);
`;

const DependencyInfoMore = styled.span`
  font-size: var(--font-size-xs);
  font-weight: 400;
`;

const DependencyInfoRiskIcon = styled(RiskIcon)`
  vertical-align: middle;
  margin-right: 1rem;
`;

const DependencyListItemContainer = styled.div`
  width: 100%;
  display: flex;
  position: relative;
  flex-direction: column;
  padding-left: 1rem;

  ${CodeReferenceLink} {
    width: 90%;
    align-self: center;
  }

  ${CodeReferenceLink}::before {
    content: '•';
    position: absolute;
    left: 1rem;
    color: var(--color-white);
    top: 2.5rem;
    transform: translateY(-50%);
  }
`;

const DependencyListItemMoreCount = styled.span`
  padding-left: 3.5rem;
`;
