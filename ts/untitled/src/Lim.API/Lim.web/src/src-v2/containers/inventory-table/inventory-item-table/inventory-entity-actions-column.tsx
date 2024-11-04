import { useMemo } from 'react';
import styled from 'styled-components';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { SvgIcon } from '@src-v2/components/icons';
import { Table } from '@src-v2/components/table/table';
import { ExternalLink, Link } from '@src-v2/components/typography';
import { generateCodeReferenceUrl } from '@src-v2/data/connectors';
import { BaseElement } from '@src-v2/types/inventory-elements/base-element';
import { InventoryElementCollectionRow } from '@src-v2/types/inventory-elements/inventory-element-collection-row';
import { CodeReference } from '@src-v2/types/risks/code-reference';
import { stopPropagation } from '@src-v2/utils/dom-utils';
import { isTypeOf } from '@src-v2/utils/ts-utils';
import { Dropdown } from '@src/src-v2/components/dropdown';

interface ResolverReferenceElement extends BaseElement {
  resolverReference: CodeReference;
}

interface ElementWithRelativeFilePath extends BaseElement {
  relativeFilePath: string;
}

interface ElementWithFilePath {
  filePath: string;
}

function getRepository(profile: any, repositoryKey: string) {
  return profile.repository || profile.repositoryByKey?.[repositoryKey];
}

export function createInventoryEntityActionsColumn(profile: any) {
  return {
    key: 'actions-menu',
    width: '10rem',
    label: '',
    resizeable: false,
    draggable: false,
    Cell: props => <ActionsMenuCell {...props} profile={profile} />,
  };
}

function ActionsMenuCell({
  data: { diffableEntity, profileKey },
  profile,
  ...props
}: {
  data: InventoryElementCollectionRow<BaseElement>;
  profile: any;
}) {
  const repository = getRepository(profile, profileKey);

  const codeReference = useMemo<CodeReference>(() => {
    if (isTypeOf<ResolverReferenceElement>(diffableEntity, 'resolverReference')) {
      return diffableEntity.resolverReference;
    }
    if (isTypeOf<ElementWithRelativeFilePath>(diffableEntity, 'relativeFilePath')) {
      return { relativeFilePath: diffableEntity.relativeFilePath };
    }
    if (isTypeOf<ElementWithFilePath>(diffableEntity, 'filePath')) {
      return { relativeFilePath: diffableEntity.filePath };
    }

    return diffableEntity.codeReference;
  }, [diffableEntity]);

  return (
    <Table.FlexCell {...props} data-action-menu data-pinned-column>
      <DropdownMenu onClick={stopPropagation} onItemClick={stopPropagation}>
        <Dropdown.Group title="Explore">
          {Boolean(codeReference) && Boolean(repository) && (
            <DropdownItemLink
              as={ExternalLink}
              href={generateCodeReferenceUrl(
                { ...repository, provider: repository.server.provider },
                codeReference
              )}>
              <SvgIcon name="Code" />
              View Code
            </DropdownItemLink>
          )}

          {profile.profileType !== 'RepositoryProfile' &&
            (profile.repositoryKeys?.length ? profile.repositoryKeys : [profileKey]).map(
              (repositoryKey: string) => (
                <ViewRepositoryItem
                  key={repositoryKey}
                  profile={profile}
                  repositoryKey={repositoryKey}
                />
              )
            )}
        </Dropdown.Group>
      </DropdownMenu>
    </Table.FlexCell>
  );
}

function ViewRepositoryItem({ profile, repositoryKey }: { profile: any; repositoryKey: string }) {
  const repository = getRepository(profile, repositoryKey);

  return (
    <DropdownItemLink as={Link} to={`/profiles/repositories/${repositoryKey}`}>
      <SvgIcon name="Repository" />
      {`View "${repository.name}" profile`}
    </DropdownItemLink>
  );
}

const DropdownItemLink = styled(Dropdown.Item)`
  color: var(--default-text-color);
  text-decoration: none;
`;
