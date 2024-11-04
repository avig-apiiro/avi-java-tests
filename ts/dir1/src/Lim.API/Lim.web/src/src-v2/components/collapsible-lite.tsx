import { ReactNode } from 'react';
import styled from 'styled-components';
import { CircleIcon } from '@src-v2/components/circle-icon';
import { BaseIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { useCollapsible } from '@src-v2/hooks/use-collapsible';
import { StyledProps, assignStyledNodes } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

export const CollapsibleLiteAttributes = [
  'open',
  'defaultOpen',
  'showMoreText',
  'showLessText',
  'moreCount',
  'onToggle',
  'showChevron',
];

type CollapsibleLitePropsType = {
  open: boolean;
  defaultOpen: boolean;
  showMoreText: string;
  showLessText: string;
  moreCount: number;
  children: ReactNode;
  onToggle: () => void;
  showChevron: boolean;
};

export const _CollapsibleLite = styled(
  ({
    open,
    defaultOpen,
    showMoreText = 'Show more',
    showLessText = 'Show less',
    moreCount,
    children,
    onToggle,
    showChevron,
    ...props
  }: StyledProps<CollapsibleLitePropsType>) => {
    const { isOpen, getTriggerProps, getContentProps } = useCollapsible({
      immutable: typeof open === 'undefined',
      open: open ?? defaultOpen,
      onToggle,
    });

    return (
      <div {...props}>
        <CollapsibleLiteButton {...getTriggerProps()}>
          <CollapsibleLiteText>
            {isOpen ? showLessText : `${showMoreText} ${moreCount ? `(${moreCount})` : ''}`}
          </CollapsibleLiteText>
          {showChevron && (
            <CircleIcon
              icon="Chevron"
              size={Size.LARGE}
              variant={Variant.TERTIARY}
              data-open={dataAttr(isOpen)}
            />
          )}
        </CollapsibleLiteButton>
        <CollapsibleLiteBody {...getContentProps()}>{children}</CollapsibleLiteBody>
      </div>
    );
  }
)`
  width: 100%;
`;

const CollapsibleLiteText = styled.span`
  font-size: var(--font-size-s);
  font-style: normal;
  font-weight: 400;
  line-height: 5rem;
  color: var(--color-blue-gray-60);

  &:hover {
    color: var(--color-blue-gray-70);
    text-decoration: underline;
  }
`;

const CollapsibleLiteBody = styled.div``;

const CollapsibleLiteButton = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 0 2rem;
  border-top: 0.25rem solid var(--color-blue-gray-20);
  margin-top: 3rem;
  cursor: pointer;

  ${BaseIcon} {
    transition: transform 400ms;
    transform: rotate(90deg);
  }

  ${CircleIcon}[data-open] {
    ${BaseIcon} {
      transition: transform 400ms;
      transform: rotate(-90deg);
    }
  }
`;

export const CollapsibleLite = assignStyledNodes(_CollapsibleLite, {
  Body: CollapsibleLiteBody,
  Button: CollapsibleLiteButton,
  Text: CollapsibleLiteText,
});
