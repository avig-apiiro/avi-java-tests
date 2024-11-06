import { ChangeEvent, FC, useCallback, useState } from 'react';
import styled from 'styled-components';
import { IconButton } from '@src-v2/components/buttons';
import { SearchInput } from '@src-v2/components/forms/search-input';
import { ErrorLayout } from '@src-v2/components/layout';
import { Modal } from '@src-v2/components/modals';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { EllipsisText, ExternalLink } from '@src-v2/components/typography';
import { customScrollbar } from '@src-v2/style/mixins';

type TrimmedCollectionDisplaySearchModalType<T> = {
  searchMethod?: ({ item, searchTerm }: { item: T; searchTerm: string }) => boolean;
  itemComponent: FC<{
    value: T;
    index: number;
  }>;
  items: T[];
  onClose: (event) => void;
};

export const TrimmedCollectionDisplaySearchModal = styled(
  <T,>({
    items,
    searchMethod,
    itemComponent: Item,
    onClose,
    ...props
  }: TrimmedCollectionDisplaySearchModalType<T>) => {
    const [filteredItems, setFilteredItems] = useState(items);

    const handleInputChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
        setFilteredItems(
          items.filter(item => searchMethod?.({ item, searchTerm: event.target.value }))
        );
      },
      [searchMethod, setFilteredItems]
    );

    return (
      // @ts-expect-error
      <Modal {...props} onClose={onClose} onClick={event => event.stopPropagation()}>
        <InputCloseContainer>
          <SearchInput onChange={handleInputChange} variant={Variant.SECONDARY} />
          <IconButton name="Close" onClick={onClose} size={Size.XXLARGE} />
        </InputCloseContainer>
        {filteredItems.length > 0 ? (
          <ItemsContainer>
            {filteredItems.map((item, index) => (
              <Item key={index} value={item} index={index} />
            ))}
          </ItemsContainer>
        ) : (
          <ErrorLayout.NoResults />
        )}
      </Modal>
    );
  }
)`
  width: 200rem;
  height: 140rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;
  padding: 8rem;
  border-radius: 3rem;
`;

const ItemsContainer = styled.div`
  ${customScrollbar};

  max-height: 140rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  ${EllipsisText} {
    display: flex;
    white-space: break-spaces;
    overflow-wrap: anywhere;
    flex-shrink: 0;
  }

  ${ExternalLink} {
    overflow: unset;
  }
`;

const InputCloseContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4rem;

  ${SearchInput} {
    width: 100%;
  }
`;
