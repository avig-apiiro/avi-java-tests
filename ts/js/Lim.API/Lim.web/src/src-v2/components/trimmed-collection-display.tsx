import _ from 'lodash';
import { FC, ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import { TextButton } from '@src-v2/components/button-v2';
import { ClampText } from '@src-v2/components/clamp-text';
import { Counter as DefaultCounter } from '@src-v2/components/counter';
import { PlainTooltipProps, Tooltip } from '@src-v2/components/tooltips/tooltip';
import { TrimmedCollectionDisplaySearchModal } from '@src-v2/components/trimmed-collection-display-search-modal';
import { ExternalLink, Link } from '@src-v2/components/typography';
import { useModalState } from '@src-v2/hooks/use-modal-state';

export function TrimmedCollectionDisplay<T>({
  limit = 3,
  limitExcessiveItems = 10,
  item: Item = DefaultClampItem<T>,
  excessiveItem,
  counter: Counter = DefaultCounter,
  tooltip: CustomTooltip = Tooltip,
  searchMethod,
  children,
}: {
  children: T[];
  limit?: number;
  limitExcessiveItems?: number;
  searchMethod?: ({ item, searchTerm }: { item: T; searchTerm: string }) => boolean;
  item?: FC<{
    value: T;
    index: number;
  }>;
  excessiveItem?: FC<{
    value: T;
    index: number;
  }>;
  counter?: FC<{
    children: ReactNode;
  }>;
  tooltip?: FC<PlainTooltipProps>;
}) {
  const [modalElement, setModal, closeModal] = useModalState();

  const ExcessiveItem = excessiveItem ?? Item;
  const [displayItems, excessiveItems] = _.partition(
    children,
    item => children.indexOf(item) < limit
  );

  const handleShowMoreClick = useCallback(
    event => {
      event.stopPropagation();
      setModal(
        <TrimmedCollectionDisplaySearchModal
          items={children}
          itemComponent={Item}
          searchMethod={searchMethod}
          onClose={closeModal}
        />
      );
    },
    [children, Item, searchMethod, closeModal]
  );

  return (
    <>
      {displayItems.map((item, index) => (
        <Item key={index} value={item} index={index} />
      ))}
      {Boolean(excessiveItems.length) && (
        <CustomTooltip
          noArrow
          interactive
          content={
            <ExcessiveContent>
              {excessiveItems.slice(0, limitExcessiveItems).map((item, index) => (
                <ExcessiveItem key={index} index={index} value={item} />
              ))}
              {excessiveItems.length > limitExcessiveItems &&
                (searchMethod ? (
                  <TextButton onClick={handleShowMoreClick}>
                    <>Show all {children.length} </>
                  </TextButton>
                ) : (
                  <>and {excessiveItems.length - limitExcessiveItems} more</>
                ))}
            </ExcessiveContent>
          }>
          <Counter>+{excessiveItems.length}</Counter>
        </CustomTooltip>
      )}
      {modalElement}
    </>
  );
}

function DefaultClampItem<T>({ value }: { value: T }) {
  return typeof value === 'string' ? <ClampText>{value}</ClampText> : <>{value}</>;
}

const ExcessiveContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;

  ${ExternalLink}, ${Link} {
    color: var(--color-blue-45);
    text-decoration: none;

    &:hover {
      color: var(--color-blue-50);
      text-decoration: underline;
    }
  }
`;
