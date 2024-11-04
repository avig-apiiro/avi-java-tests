import { observer } from 'mobx-react';
import {
  Children,
  ComponentType,
  HTMLProps,
  ReactEventHandler,
  ReactNode,
  Ref,
  forwardRef,
} from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Collapsible } from '@src-v2/components/collapsible';
import { CollapsibleLite, CollapsibleLiteAttributes } from '@src-v2/components/collapsible-lite';
import { useGroupProperties } from '@src-v2/hooks';

type ToType = {
  state: any;
  pathname: string;
};

type CardProps = HTMLProps<HTMLDivElement> & {
  to?: string | ToType;
  href?: string;
  onClick?: ReactEventHandler;
};

export const Card = styled(
  forwardRef<HTMLDivElement | HTMLAnchorElement, CardProps>((props, ref?) => {
    let Component: any;
    let refAs: any;

    if (props.to) {
      Component = Link;
      refAs = ref as Ref<HTMLAnchorElement>;
    } else if (props.href) {
      Component = 'a';
      refAs = ref as Ref<HTMLAnchorElement>;
    } else {
      Component = 'div';
      refAs = ref as Ref<HTMLDivElement>;
    }

    return <Component ref={refAs} {...props} />;
  })
)`
  padding: var(--card-padding, 6rem);
  border-radius: 3rem;
  background-color: var(--color-white);
  box-shadow: ${props =>
    props.to || props.href || props.onClick || props['data-clickable']
      ? 'var(--elevation-1)'
      : 'var(--elevation-0)'};
  transition: box-shadow 200ms;

  &:hover {
    box-shadow: ${props =>
      props.to || props.href || props.onClick || props['data-clickable']
        ? 'var(--elevation-2)'
        : 'var(--elevation-0)'};
  }
`;

export const CollapsibleCard = styled(
  observer(({ ...props }) => <Card as={Collapsible} {...props} data-clickable />)
)`
  padding: 0;

  &[data-open] {
    box-shadow: var(--elevation-4);
  }

  ${Collapsible.Head} {
    padding: var(--card-padding, 6rem);
  }

  ${Collapsible.Body} {
    padding: 0 var(--card-padding, 6rem);
  }

  ${Collapsible.Title} {
    font-size: var(--font-size-m);
  }
`;

interface CollapsibleLiteProps {
  open?: boolean;
  defaultOpen?: boolean;
  showMoreText?: string;
  showLessText?: string;
  moreCount?: number;
  onToggle?: (cardId: string, value: boolean) => void;
  showChevron?: boolean;
}

export const DoubleCollapsibleCard = styled(
  ({
    card: Card = CollapsibleCardWrapper,
    title,
    content,
    nestedContent,
    previewOpen,
    ...props
  }: {
    title?: string;
    card?: ComponentType;
    content: ReactNode;
    nestedContent?: ReactNode;
    previewOpen?: boolean;
  } & CollapsibleLiteProps) => {
    const [collapsibleProps, cardProps] = useGroupProperties(props, CollapsibleLiteAttributes);
    return (
      <Card {...cardProps} title={title} open={previewOpen}>
        {content}
        {nestedContent && Boolean(Children.count(nestedContent)) && (
          <CollapsibleLite {...collapsibleProps} showChevron>
            {nestedContent}
          </CollapsibleLite>
        )}
      </Card>
    );
  }
)`
  box-shadow: none;
  border: 0.25rem solid var(--color-blue-gray-30);

  &[data-open],
  &:hover {
    box-shadow: none;
  }

  &[data-open] > ${Collapsible.Head} {
    margin-bottom: var(--card-vertical-padding, 4rem);
  }

  ${CollapsibleLite} {
    display: flex;
    flex-direction: column-reverse;
  }
`;

const CollapsibleCardWrapper = styled(CollapsibleCard)`
  --card-padding: 0;
  padding: var(--card-vertical-padding, 4rem) var(--card-horizontal-padding, 5rem);
`;

export const DoubleCollapsibleCardWrapper = styled(DoubleCollapsibleCard)`
  ${Collapsible.Body} {
    margin-bottom: ${props => (!props.nestedContent ? '6rem' : '0')};
  }
`;
