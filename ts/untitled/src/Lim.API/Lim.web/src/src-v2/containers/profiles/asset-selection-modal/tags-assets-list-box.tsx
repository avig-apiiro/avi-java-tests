import { useCallback } from 'react';
import { Badge } from '@src-v2/components/badges';
import { ClampText } from '@src-v2/components/clamp-text';
import { DualListBoxProps } from '@src-v2/components/forms/dual-list-box';
import { DualListBoxControl } from '@src-v2/components/forms/form-controls';
import { Heading5 } from '@src-v2/components/typography';
import { TagResponseBadge } from '@src-v2/containers/profiles/profile-tags/tag-response-badge';
import { useInject } from '@src-v2/hooks';
import { SearchParams } from '@src-v2/services';
import { FindingTag, TagResponse } from '@src-v2/types/profiles/tags/profile-tag';

export const ApplicationTagsListBoxControl = () => (
  <TagsDualListBoxControl
    name="applicationTags"
    searchMethod={useInject().applicationProfilesV2.getAllFlatApplicationTags}
    filterBy={filterTagResponse}
    renderMainItem={TagResponseItem}
  />
);

export const RepositoryTagsListBoxControl = () => (
  <TagsDualListBoxControl
    name="repositoryTags"
    searchMethod={useInject().repositoryProfiles.getAllFlatProviderRepositoryTags}
    filterBy={filterTagResponse}
    renderMainItem={TagResponseItem}
  />
);

export const FindingTagsListBoxControl = () => (
  <TagsDualListBoxControl
    name="findingTags"
    searchMethod={useInject().orgTeamProfiles.searchFindingTags}
    filterBy={filterFindingTag}
    renderMainItem={FindingTagItem}
  />
);

const TagsDualListBoxControl = <T extends { key: string; value: string }>({
  name,
  searchMethod,
  renderMainItem,
  filterBy,
}: {
  name: string;
  searchMethod: () => Promise<T[]>;
} & Pick<DualListBoxProps<T>, 'filterBy' | 'renderMainItem'>) => {
  const mockSearchMethod = useCallback(
    async ({ searchTerm }: Partial<SearchParams>) => {
      const tags = await searchMethod();
      const filteredTags = searchTerm?.length
        ? tags.filter(item => filterBy(item, searchTerm))
        : tags;

      return Promise.resolve({
        items: filteredTags,
        count: filteredTags.length,
        total: tags.length,
      });
    },
    [searchMethod]
  );

  return (
    <DualListBoxControl
      name={name}
      searchMethod={mockSearchMethod}
      filterBy={filterBy}
      keyBy={tag => `${tag.key}_${tag.value}`}
      renderMainItem={renderMainItem}
    />
  );
};

const TagResponseItem = ({ item }: { item: TagResponse }) => <TagResponseBadge tag={item} />;

const filterTagResponse = (tag: TagResponse, searchTerm: string) => {
  return (tag.name + tag.value).toLowerCase().includes(searchTerm.toLowerCase());
};

const FindingTagItem = ({ item }: { item: FindingTag }) => {
  return (
    <Badge>
      <Heading5>
        <ClampText>{item.key}</ClampText>
      </Heading5>
      &nbsp;:&nbsp;<ClampText>{item.value}</ClampText>
    </Badge>
  );
};

const filterFindingTag = (tag: FindingTag, searchTerm: string) => {
  return (tag.key + tag.value).toLowerCase().includes(searchTerm.toLowerCase());
};
