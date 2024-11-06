import styled from 'styled-components';
import { TextButton } from '@src-v2/components/button-v2';
import { IconAlignment } from '@src-v2/components/collapsible';
import { UsedInCodeDisplay } from '@src-v2/containers/entity-pane/sca/main-tab/sca-main-tab';
import { useScaPaneContext } from '@src-v2/containers/entity-pane/sca/use-sca-pane-context';
import { CollapsibleRow } from '@src-v2/containers/pages/artifacts/artifact-pane/components/dependency-tree';
import { UsedInCodeIcon } from '@src-v2/containers/risks/sca/sca-table-content';
import { useToggle } from '@src-v2/hooks';
import { TopLevelUsedInCode } from '@src-v2/types/inventory-elements';
import { UsedInCode } from '@src-v2/types/risks/risk-types/oss-risk-trigger-summary';

export const TopLevelUsedInCodeTree = () => {
  const [showAll, toggleShowAll] = useToggle();
  const limitedDisplay = 3;
  const { element } = useScaPaneContext();
  const { usedInCodeReferences, topLevelUsedInCode } = element;
  const topLevelUsedInCodeArr = [
    ...topLevelUsedInCode.filter(
      ({ usedInCodeStatus }) => usedInCodeStatus === UsedInCode.Imported
    ),
  ];

  if (usedInCodeReferences?.length) {
    topLevelUsedInCodeArr.unshift({
      name: 'Direct import of sub-dependency',
      usedInCodeReferences,
      usedInCodeStatus: UsedInCode.Imported,
      version: '',
      id: 'direct-import',
    });
  }

  return (
    <>
      <TopLevelWrapper>
        <TopLevelHeader>
          <UsedInCodeIcon name="Valid" data-type={UsedInCode.Imported} />
          <UsedInCodeTitle topLevelUsedInCodeArr={topLevelUsedInCodeArr} />
        </TopLevelHeader>
        {topLevelUsedInCodeArr
          .slice(0, showAll ? topLevelUsedInCodeArr.length : limitedDisplay)
          .map((topLevel, index) => (
            <CollapsibleUsedInCode key={`CollapsibleUsedInCode-${index}`} toLevel={topLevel} />
          ))}
        {topLevelUsedInCodeArr.length - limitedDisplay > 0 && (
          <TextButton onClick={toggleShowAll} underline>
            {!showAll && (
              <TopLevelMore>Show {topLevelUsedInCodeArr.length - limitedDisplay} more</TopLevelMore>
            )}
            {showAll && <TopLevelMore>Show less</TopLevelMore>}
          </TextButton>
        )}
      </TopLevelWrapper>
    </>
  );
};

const UsedInCodeTitle = ({
  topLevelUsedInCodeArr,
}: {
  topLevelUsedInCodeArr: TopLevelUsedInCode[];
}) => {
  const isDirectImport = topLevelUsedInCodeArr.some(topLevel => topLevel.id === 'direct-import');

  if (isDirectImport) {
    return (
      <>
        {topLevelUsedInCodeArr.length > 1
          ? 'This package is introduced directly and through top level dependencies which are imported in the code:'
          : 'This package is directly imported in the code:'}
      </>
    );
  }
  return (
    <>This package is introduced through top level dependencies which are imported in the code:</>
  );
};

const CollapsibleUsedInCode = ({ toLevel }: { toLevel: TopLevelUsedInCode }) => {
  const { relatedProfile } = useScaPaneContext();
  const { usedInCodeReferences, name, version } = toLevel;

  return (
    <CollapsibleRow
      title={`${name}${version ? `:${version}` : ''}`}
      alignIcon={IconAlignment.Left}
      clickable={usedInCodeReferences.length > 0}>
      {usedInCodeReferences.length > 0 && (
        <DependencyInfoContentRowWrapper>
          <UsedInCodeDisplay
            repository={relatedProfile}
            parsingTargetCodeReferences={usedInCodeReferences}
          />
        </DependencyInfoContentRowWrapper>
      )}
    </CollapsibleRow>
  );
};

const TopLevelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 100%;
`;

const TopLevelHeader = styled.div`
  display: flex;
  gap: 1rem;
`;

const TopLevelMore = styled.span`
  color: var(--color-blue-gray-55);
  font-size: var(--font-size-xs);
  font-weight: 400;
`;

const DependencyInfoContentRowWrapper = styled.div<{ index?: number }>`
  padding-left: 7rem;
`;
