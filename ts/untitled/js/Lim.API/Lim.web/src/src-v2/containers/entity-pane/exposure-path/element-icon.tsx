import _ from 'lodash';
import { HTMLAttributes, forwardRef } from 'react';
import styled from 'styled-components';
import { LanguageCircle, VendorCircle } from '@src-v2/components/circles';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { getLanguageIconUrl, getVendorIconUrl } from '@src-v2/data/icons';
import { ExposurePathNodeType } from '@src-v2/types/exposure-path';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

export const NodeToElementIcon = ({
  node,
  selected,
  isPopover,
}: {
  node: ExposurePathNodeType;
  selected?: boolean;
  isPopover?: boolean;
}) => (
  <IconContainer selected={selected} matched={node.isMatched}>
    {_.first(
      node.indicators
        .map(indicator => {
          switch (indicator.type) {
            case 'Provider':
              return getVendorIconUrl(indicator.name) ? (
                <VendorCircle name={indicator.name} size={isPopover ? Size.LARGE : Size.XLARGE} />
              ) : null;
            case 'Language':
              return getLanguageIconUrl(indicator.name) ? (
                <LanguageCircle
                  name={_.upperFirst(indicator.name)}
                  size={isPopover ? Size.LARGE : Size.XLARGE}
                />
              ) : null;
            case 'Svg':
              return (
                <NodeIcon
                  name={indicator.name}
                  category={node.nodeCategory}
                  selected={selected}
                  circle={!isPopover}
                  matched={node.isMatched}
                />
              );
            default:
              return null;
          }
        })
        .filter(item => !_.isNil(item))
    )}
  </IconContainer>
);

const IconContainer = styled(
  forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement> & StyledProps<{ selected?: boolean; matched?: boolean }>
  >(({ children, selected, matched, ...props }, ref) => (
    <div ref={ref} data-selected={dataAttr(selected)} data-matched={dataAttr(matched)} {...props}>
      {children}
    </div>
  ))
)`
  &:hover&[data-matched] {
    cursor: pointer;
  }

  ${LanguageCircle} {
    background-color: var(--color-white);
    border: 0.25rem solid var(--color-blue-gray-30);
  }

  &:hover {
    ${LanguageCircle} {
      background-color: var(--color-blue-gray-20);
      border-color: var(--color-blue-gray-40);
    }
    ${VendorCircle} {
      background-color: var(--color-blue-gray-20);
      border-color: var(--color-blue-gray-40);
    }
  }

  &[data-selected] {
    ${LanguageCircle} {
      background-color: var(--color-blue-gray-25);
      border-color: var(--color-blue-gray-50);
    }
    ${VendorCircle} {
      background-color: var(--color-blue-gray-25);
      border-color: var(--color-blue-gray-50);
    }
  }
`;

// noinspection CssUnresolvedCustomProperty
const NodeIcon = styled(
  ({
    name,
    category,
    circle,
    selected,
    matched,
    ...props
  }: {
    name: string;
    category: string;
    selected?: boolean;
    circle?: boolean;
    matched?: boolean;
  }) => {
    return (
      <div
        {...props}
        data-circle={dataAttr(circle)}
        data-category={category}
        data-selected={dataAttr(selected)}
        data-matched={dataAttr(matched)}>
        <SvgIcon name={name} size={Size.SMALL} />
      </div>
    );
  }
)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 8rem;
  height: 8rem;
  flex-shrink: 0;
  border-radius: 1rem;

  background-color: var(--node-color);

  &:hover,
  &[data-selected] {
    border: 0.25rem solid var(--node-border-color);
  }

  &[data-circle] {
    width: 9rem;
    height: 9rem;
    border-radius: 12rem;
  }

  ${BaseIcon} {
    color: var(--node-icon-color);
  }

  &:not([data-matched]) {
    background-color: var(--color-blue-gray-15);
    border: 0.25rem solid var(--color-blue-gray-30);
    ${BaseIcon} {
      color: var(--color-blue-gray-35);
    }
  }

  &[data-category='OpenSource'] {
    --node-color: var(--color-purple-20);
    --node-icon-color: var(--color-purple-50);
    --node-border-color: var(--color-purple-35);
  }
  &[data-category='CodeStructure'] {
    --node-color: var(--color-green-20);
    --node-icon-color: var(--color-green-60);
    --node-border-color: var(--color-green-35);
  }
  &[data-category='DataManagement'] {
    --node-color: var(--color-orange-20);
    --node-icon-color: var(--color-orange-60);
    --node-border-color: var(--color-orange-35);
  }
  &[data-category='TrafficManagement'] {
    --node-color: var(--color-pink-20);
    --node-icon-color: var(--color-pink-55);
    --node-border-color: var(--color-pink-35);
  }
  &[data-category='ConfidentialInformation'] {
    --node-color: var(--color-red-20);
    --node-icon-color: var(--color-red-60);
    --node-border-color: var(--color-red-35);
  }
  &[data-category='EntryPoints'] {
    --node-color: var(--color-blue-25);
    --node-icon-color: var(--color-blue-70);
    --node-border-color: var(--color-blue-50);
  }
  &[data-category='SupplyChain'] {
    --node-color: var(--color-yellow-20);
    --node-icon-color: var(--color-yellow-60);
    --node-border-color: var(--color-yellow-35);
  }
`;
