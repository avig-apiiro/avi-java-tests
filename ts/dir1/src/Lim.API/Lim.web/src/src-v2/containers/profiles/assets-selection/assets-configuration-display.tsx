import _ from 'lodash';
import { useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import styled from 'styled-components';
import { Badge } from '@src-v2/components/badges';
import { ClampText } from '@src-v2/components/clamp-text';
import { Checkbox } from '@src-v2/components/forms';
import { VendorIcon } from '@src-v2/components/icons';
import {
  SubNavigationMenu,
  SubNavigationMenuOptionType,
} from '@src-v2/components/sub-navigation-menu';
import { Heading5, ListItem, UnorderedList } from '@src-v2/components/typography';
import { AssetsConfiguration } from '@src-v2/containers/profiles/assets-selection/assets-configuration-section';
import { TagResponseBadge } from '@src-v2/containers/profiles/profile-tags/tag-response-badge';
import { LeanApplication } from '@src-v2/types/profiles/lean-application';
import { LeanConsumable, LeanRepositoryConsumable } from '@src-v2/types/profiles/lean-consumable';
import { FindingTag, TagResponse } from '@src-v2/types/profiles/tags/profile-tag';
import { humanize } from '@src-v2/utils/string-utils';
import { entries, isTypeOf } from '@src-v2/utils/ts-utils';

type SelectedAssetsDisplayProps = {
  assetsConfiguration: Partial<AssetsConfiguration>;
};

export const AssetsConfigurationDisplay = ({ assetsConfiguration }: SelectedAssetsDisplayProps) => {
  const navigationMenuOptions = useMemo<SubNavigationMenuOptionType[]>(
    () =>
      entries(assetsConfiguration)
        .filter(([, assets]) => _.isArray(assets) && assets.length)
        .map(([key, assets]) => ({
          key: key.toString(),
          label: `${humanize(key)} (${(assets as any[]).length})`,
        })),
    [assetsConfiguration]
  );

  const [selectedNavigationOption, setSelectedNavigationOption] =
    useState<SubNavigationMenuOptionType>();
  const activeNavigation = selectedNavigationOption ?? navigationMenuOptions[0];
  const items = assetsConfiguration[activeNavigation.key as keyof AssetsConfiguration];

  return (
    <AssetsContainer>
      <SubNavigationMenu
        options={navigationMenuOptions}
        currentOption={activeNavigation}
        onChange={setSelectedNavigationOption}
      />

      <UnorderedList data-scrollbar-gutters>
        {Array.isArray(items) &&
          items?.map((asset: unknown, index: number) => (
            <ListItem key={index}>
              <Checkbox disabled checked />
              <AssetItemFactory asset={asset} />
            </ListItem>
          ))}
      </UnorderedList>
    </AssetsContainer>
  );
};

const AssetsContainer = styled.div`
  display: flex;
  gap: 4rem;

  ${SubNavigationMenu} {
    width: 49rem;
    min-height: 55rem;
  }

  ${UnorderedList} {
    height: 55rem;
    flex-grow: 1;
    padding: 3rem;
    overflow: auto;
    border: 0.25rem solid var(--color-blue-gray-35);
    border-radius: 3rem;

    ${ListItem} {
      height: 8rem;
      display: flex;
      align-items: center;
      padding: 0 2rem;
      gap: 2rem;

      &:not(:last-child) {
        margin-bottom: 1rem;
      }

      ${Checkbox} {
        margin-right: 1rem;
      }
    }
  }
`;

function AssetItemFactory({ asset }: { asset: unknown }) {
  if (isTypeOf<FindingTag>(asset, 'value') && asset.value) {
    if (isTypeOf<TagResponse>(asset, 'name')) {
      return <TagResponseBadge tag={asset} />;
    }

    return (
      <Badge>
        <Heading5>
          <ClampText>{asset.key}</ClampText>
        </Heading5>
        &nbsp;:&nbsp;<ClampText>{asset.value}</ClampText>
      </Badge>
    );
  }

  if (isTypeOf<LeanConsumable>(asset, 'provider')) {
    const referenceName = isTypeOf<LeanRepositoryConsumable>(asset, 'referenceName')
      ? asset.referenceName
      : null;

    return (
      <>
        <VendorIcon name={asset.provider} />
        {asset.name} {referenceName && <>({referenceName})</>}
      </>
    );
  }

  if (isTypeOf<LeanApplication>(asset, 'name')) {
    return <>{asset.name}</>;
  }

  console.warn('Unknown asset type', asset);
  return null;
}

export function useWatchAssetsConfiguration<T>(categories: (keyof T)[]) {
  const formValues = useWatch<T>();
  return useMemo(() => _.pick(formValues, categories) as Partial<T>, [formValues, categories]);
}
