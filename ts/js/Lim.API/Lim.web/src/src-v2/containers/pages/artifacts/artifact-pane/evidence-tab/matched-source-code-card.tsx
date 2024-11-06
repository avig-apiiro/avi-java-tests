import _ from 'lodash';
import { useMemo } from 'react';
import styled from 'styled-components';
import { ActivityIndicator } from '@src-v2/components/activity-indicator';
import { TextButton } from '@src-v2/components/button-v2';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { IconAlignment } from '@src-v2/components/collapsible';
import { SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Link, SubHeading4 } from '@src-v2/components/typography';
import {
  CollapsibleRow,
  DependencyTree,
} from '@src-v2/containers/pages/artifacts/artifact-pane/components/dependency-tree';
import { useArtifactPaneContext } from '@src-v2/containers/pages/artifacts/artifact-pane/use-artifact-pane-context';
import { useInject, useSuspense, useToggle } from '@src-v2/hooks';
import { BusinessImpact } from '@src-v2/types/enums/business-impact';
import { DependencyElement } from '@src-v2/types/inventory-elements';
import { stopPropagation } from '@src-v2/utils/dom-utils';
import { BusinessImpactIndicator } from '@src/src-v2/components/business-impact-indictor';
import { CodeAssetsDependency } from '@src/src-v2/types/artifacts/artifacts-types';

export const MatchedSourceCodeCard = ({
  artifactKey,
  ...props
}: { artifactKey: string } & ControlledCardProps) => {
  const { artifacts } = useInject();
  const [showAll, toggleShowAll] = useToggle();
  const limitedDisplay = 3;
  const { finding: findingObj } = useArtifactPaneContext();

  const codeAssetsDependencies = useSuspense(artifacts.getCodeAssetsDependencies, {
    key: artifactKey,
    dependencyName: findingObj.finding.packageName,
  });

  const groupedByRepositoryKey = useMemo(() => {
    const groupedByRepository = _.groupBy(codeAssetsDependencies, 'repositoryKey');

    const mappedObject = _.mapValues(groupedByRepository, (group: CodeAssetsDependency[]) => {
      const modules = _.mapValues(_.groupBy(group, 'moduleName'), modGroup => ({
        moduleName: modGroup[0].moduleName,
        dependencyDeclarations: _.flatMap(modGroup, 'dependencyDeclarations'),
      }));

      return { ...group[0], modules: _.values(modules) };
    });

    const pairs = _.toPairs(mappedObject);
    const sortedPairs = _.sortBy(pairs, ([, value]) =>
      _.every(value.modules, module => _.isEmpty(module.dependencyDeclarations))
    );
    return _.fromPairs(sortedPairs);
  }, [codeAssetsDependencies]);

  const isAllMatchedCodeContainsDependency = useMemo(() => {
    return Object.keys(groupedByRepositoryKey).every(repositoryKey => {
      const repository = groupedByRepositoryKey[repositoryKey];
      return repository.modules.every(module => module.dependencyDeclarations.length > 0);
    });
  }, [groupedByRepositoryKey]);

  if (Object.keys(groupedByRepositoryKey)?.length === 0) {
    return null;
  }

  return (
    <ControlledCard {...props} title="Matched source code">
      <SubHeading4>
        {isAllMatchedCodeContainsDependency
          ? `The ${findingObj.finding.packageName} dependency was declared in the matched code below:`
          : `The ${findingObj.finding.packageName} dependency wasn't found in the matched code`}
      </SubHeading4>
      <RepositoriesCardWrapper>
        {Object.keys(groupedByRepositoryKey)
          .slice(0, showAll ? Object.keys(groupedByRepositoryKey).length : limitedDisplay)
          .map((repositoryKey, index) => {
            const repository = groupedByRepositoryKey[repositoryKey];
            const isAnyDependencyDeclarations = repository.modules.some(
              module => module.dependencyDeclarations.length > 0
            );

            return (
              <CollapsibleRow
                key={`CollapsibleRepository-${index}`}
                title={
                  <Title>
                    <VendorIcon name={repository.provider} />
                    <Link
                      to={`/profiles/repositories/${repository.repositoryKey}`}
                      onClick={stopPropagation}>
                      {repository.repositoryName} ({repository.referenceName})
                    </Link>
                    {repository.repositoryBusinessImpact && (
                      <BusinessImpactIndicator
                        businessImpact={
                          BusinessImpact[repository.repositoryBusinessImpact.toLowerCase()]
                        }
                        size={Size.XXSMALL}
                      />
                    )}
                    <ActivityIndicator active={repository.repositoryIsActive} />
                    {isAllMatchedCodeContainsDependency
                      ? !isAnyDependencyDeclarations && <>(doesn’t introduce this dependency)</>
                      : ''}
                  </Title>
                }
                alignIcon={IconAlignment.Left}
                clickable={isAnyDependencyDeclarations}>
                <DependencyModules
                  provider={repository.provider}
                  modules={repository?.modules}
                  isAnyDependencyDeclarations={isAnyDependencyDeclarations}
                  repository={{
                    referenceName: repository.referenceName,
                    vendor: repository.provider,
                    url: repository.url,
                  }}
                />
              </CollapsibleRow>
            );
          })}
        {Object.keys(groupedByRepositoryKey).length - limitedDisplay > 0 && (
          <TextButton onClick={toggleShowAll} underline>
            {!showAll && (
              <DependencyMore>
                Show {Object.keys(groupedByRepositoryKey).length - limitedDisplay} more
              </DependencyMore>
            )}
            {showAll && <DependencyMore>Show less</DependencyMore>}
          </TextButton>
        )}
      </RepositoriesCardWrapper>
    </ControlledCard>
  );
};

const DependencyModules = ({
  modules = [],
  isAnyDependencyDeclarations,
  repository,
  provider,
}: {
  modules: { moduleName: string; dependencyDeclarations: DependencyElement[] }[];
  isAnyDependencyDeclarations: boolean;
  repository: { referenceName: string; vendor: string; url: string };
  provider: string;
}) => {
  return (
    <>
      {modules?.map((module, index) => {
        if (!isAnyDependencyDeclarations) {
          return null;
        }

        if (module.moduleName === '') {
          return (
            <ModuleDependencyDeclarations
              key={`CollapsibleModule-${index}`}
              provider={provider}
              repository={repository}
              module={module}
            />
          );
        }

        return (
          <>
            {module.dependencyDeclarations.map(dependencyDeclaration => (
              <DependencyCollapsibleModule
                key={`CollapsibleModule-${index}`}
                title={
                  <Title>
                    <SvgIcon name="Module" size={Size.XXSMALL} />
                    Module:
                    {module.moduleName}
                  </Title>
                }
                alignIcon={IconAlignment.Left}
                clickable>
                <ModuleDependencyDeclaration
                  dependencyDeclaration={dependencyDeclaration}
                  repository={repository}
                />
              </DependencyCollapsibleModule>
            ))}
          </>
        );
      })}
    </>
  );
};

const ModuleDependencyDeclarations = ({
  module,
  repository,
}: {
  repository: { referenceName: string; vendor: string; url: string };
  module: { moduleName: string; dependencyDeclarations: DependencyElement[] };
  provider: string;
}) => {
  return (
    <>
      {module.dependencyDeclarations?.map(dependencyDeclaration => (
        <ModuleDependencyDeclaration
          repository={repository}
          dependencyDeclaration={dependencyDeclaration}
        />
      ))}
    </>
  );
};

const ModuleDependencyDeclaration = ({
  dependencyDeclaration,
  repository,
}: {
  dependencyDeclaration: DependencyElement;
  repository: { referenceName: string; vendor: string; url: string };
}) => {
  const { risk } = useArtifactPaneContext();

  return (
    <DependencyCollapsibleModuleContent>
      {dependencyDeclaration?.dependencyPaths?.ApiiroSca?.totalInfoPathsCount > 0 ? (
        <DependencyTree
          relatedEntity={risk?.relatedEntity}
          isDivider={false}
          repository={repository}
          dependencyInfoPathsSummary={dependencyDeclaration.dependencyPaths?.ApiiroSca}
        />
      ) : (
        <DirectlyDeclared>
          <span>Declared directly in</span>
          <CodeReferenceLink
            codeReference={dependencyDeclaration.codeReference}
            repository={repository}
          />
        </DirectlyDeclared>
      )}
    </DependencyCollapsibleModuleContent>
  );
};

const DependencyMore = styled.span`
  color: var(--color-blue-gray-55);
  font-size: var(--font-size-xs);
  font-weight: 400;
`;

const RepositoriesCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 4rem;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const DependencyCollapsibleModule = styled(CollapsibleRow)`
  margin-left: 5rem;
`;

const DependencyCollapsibleModuleContent = styled.div`
  margin-left: 7rem;
`;

const DirectlyDeclared = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;

  span {
    flex-shrink: 0;
  }
`;
