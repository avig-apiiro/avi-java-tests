import orderBy from 'lodash/orderBy';
import styled from 'styled-components';
import { TextButton } from '@src-v2/components/button-v2';
import { ClampPath } from '@src-v2/components/clamp-text';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { Collapsible, IconAlignment } from '@src-v2/components/collapsible';
import { Divider } from '@src-v2/components/divider';
import { SvgIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { ScaDeclaredIn } from '@src-v2/containers/entity-pane/sca/main-tab/sca-main-tab';
import { useToggle } from '@src-v2/hooks';
import {
  DependencyInfo,
  DependencyInfoPath,
  DependencyInfoPathsSummary,
} from '@src-v2/types/inventory-elements';
import { LeanConsumableProfile } from '@src-v2/types/profiles/lean-consumable-profile';

export const DependencyTree = ({
  dependencyInfoPathsSummary,
  repository,
  relatedEntity,
  isDivider = true,
}: {
  dependencyInfoPathsSummary: DependencyInfoPathsSummary;
  isDivider?: boolean;
  repository?: { referenceName: string; vendor: string; url: string };
  relatedEntity: LeanConsumableProfile;
}) => {
  const [showAll, toggleShowAll] = useToggle();
  const limitedDisplay = 3;
  const { topInfoPaths, hasSameCodeReference } = dependencyInfoPathsSummary;

  return (
    <>
      {isDivider && <Divider />}
      <DependencyWrapper>
        <IntroducedThrough>
          Introduced through top level dependencies in
          {hasSameCodeReference &&
            (repository ? (
              <CodeReferenceLink
                codeReference={topInfoPaths[0]?.codeReference}
                repository={repository}
              />
            ) : (
              <>
                {topInfoPaths[0]?.codeReference?.relativeFilePath && (
                  <> (referenced by {topInfoPaths[0]?.codeReference?.relativeFilePath})</>
                )}
              </>
            ))}
          :
        </IntroducedThrough>
        {orderBy(topInfoPaths, path => path.orderedPath.length, 'asc')
          .slice(0, showAll ? topInfoPaths.length : limitedDisplay)
          .map((path, index) => (
            <CollapsibleDependency
              key={`DependencyWrapper-${index}`}
              relatedEntity={relatedEntity}
              path={path}
              index={index}
              hasSameCodeReference={hasSameCodeReference}
            />
          ))}
        {topInfoPaths.length - limitedDisplay > 0 && (
          <TextButton onClick={toggleShowAll} underline>
            {!showAll && (
              <DependencyMore>Show {topInfoPaths.length - limitedDisplay} more</DependencyMore>
            )}
            {showAll && <DependencyMore>Show less</DependencyMore>}
          </TextButton>
        )}
      </DependencyWrapper>
    </>
  );
};

const CollapsibleDependency = ({
  index,
  hasSameCodeReference,
  relatedEntity,
  path,
}: {
  index: number;
  hasSameCodeReference: boolean;
  relatedEntity: LeanConsumableProfile;
  path: DependencyInfoPath;
}) => {
  const { orderedPath, codeReference } = path;

  return (
    <CollapsibleRow
      key={`DependencyCollapsible-${index}`}
      title={
        <DependencyTitle>
          {orderedPath[0].name}: {orderedPath[0].version}
          {path.codeReference?.relativeFilePath ? (
            <>
              {' '}
              (Referenced by <ClampPath>{`${path.codeReference.relativeFilePath})`}</ClampPath>
            </>
          ) : null}
          {!hasSameCodeReference && relatedEntity && (
            <ScaDeclaredIn
              codeReference={codeReference}
              relatedEntity={relatedEntity}
              label="(Declared in"
            />
          )}
        </DependencyTitle>
      }
      alignIcon={IconAlignment.Left}
      clickable={orderedPath.length > 1}>
      {orderedPath.slice(1).length > 0 && (
        <DependencyContent orderedPath={orderedPath} topInfoPathIndex={index} />
      )}
    </CollapsibleRow>
  );
};

export const CollapsibleRow = styled(({ clickable, children, ...props }) => (
  <Collapsible {...props}>{children}</Collapsible>
))`
  &[data-open] > ${Collapsible.Head} > ${Collapsible.Chevron} {
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
    display: ${props => (props.clickable ? 'inherit' : 'none')};
  }
`;

const DependencyContent = ({
  orderedPath,
  topInfoPathIndex,
}: {
  orderedPath: DependencyInfo[];
  topInfoPathIndex: number;
}) => {
  const arrWithoutTop = orderedPath.slice(1);

  return (
    <DependencyContentWrapper>
      {arrWithoutTop.map((path, index) => (
        <DependencyContentRowWrapper key={`${path.name}-${path.version}`} index={index + 1}>
          <DependencyTreeBranch name="TreeBranch" size={Size.XSMALL} />
          <div key={`DependencyPathWrapper-${topInfoPathIndex}${index}`}>
            {path.name}
            {path.version ? `: ${path.version}` : ''}
          </div>
        </DependencyContentRowWrapper>
      ))}
    </DependencyContentWrapper>
  );
};

const DependencyMore = styled.span`
  color: var(--color-blue-gray-55);
  font-size: var(--font-size-xs);
  font-weight: 400;
`;

const DependencyTitle = styled.div`
  display: flex;
  gap: 1rem;
`;

const DependencyTreeBranch = styled(SvgIcon)`
  color: var(--color-blue-gray-50);
`;

const DependencyContentRowWrapper = styled.div<{ index?: number }>`
  display: flex;
  padding-left: ${props => `${props.index * 30}px`};
  gap: 1rem;
`;

const DependencyContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
  gap: 2rem;
`;

const DependencyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 100%;
`;

const IntroducedThrough = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  font-weight: 300;

  ${CodeReferenceLink} {
    width: fit-content;
  }
`;
