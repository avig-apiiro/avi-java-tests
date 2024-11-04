import { HTMLProps, forwardRef } from 'react';
import { Link as _Link, NavLink as _NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { StyledProps } from '@src-v2/types/styled';

// New Typography
export const Heading1 = styled.h1`
  font-size: var(--font-size-xxl);
  font-weight: 600;
  line-height: 8rem;
`;

export const Heading2 = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: 600;
  line-height: 7rem;
`;

export const Heading3 = styled.h3`
  font-size: var(--font-size-l);
  font-weight: 600;
  line-height: 6rem;
`;

export const Heading4 = styled.h4`
  font-size: var(--font-size-m);
  font-weight: 600;
  line-height: 5rem;
`;

export const Heading5 = styled.h5`
  font-size: var(--font-size-s);
  font-weight: 600;
  line-height: 5rem;
`;

export const Heading6 = styled.h6`
  font-size: var(--font-size-xs);
  font-weight: 600;
  line-height: 4rem;
  text-transform: uppercase;
`;

export const SubHeading1 = styled.div`
  font-size: var(--font-size-xl);
  font-weight: 400;
  line-height: 7rem;
  color: var(--color-blue-gray-55);
`;

export const SubHeading2 = styled.div`
  font-size: var(--font-size-l);
  font-weight: 300;
  line-height: 6rem;
  color: var(--color-blue-gray-55);
`;

export const SubHeading3 = styled.div`
  font-size: var(--font-size-m);
  font-weight: 300;
  line-height: 5rem;
  color: var(--color-blue-gray-70);

  &[data-variant=${Variant.SECONDARY}] {
    color: var(--color-blue-gray-55);
  }
`;

export const SubHeading4 = styled.div`
  font-size: var(--font-size-s);
  font-weight: 300;
  line-height: 5rem;
  color: var(--color-blue-gray-55);
`;

export const Caption1 = styled.div`
  font-size: var(--font-size-xs);
  font-weight: 400;
  line-height: 4rem;
`;

export const Caption2 = styled.div`
  font-size: 2.75rem;
  font-weight: 400;
  line-height: 3rem;
`;

// Old typography
export const Title = styled.h1`
  font-size: 3.25em;
  font-weight: 700;
  margin-bottom: 5rem;
`;

export const Subtitle = styled.h2`
  font-size: 2.75em;
  margin-bottom: 4rem;
`;

export const Heading = styled.h3`
  font-size: 1.25em;
  font-weight: 700;

  &:not(:last-child) {
    margin-bottom: 2rem;
  }
`;

export const Paragraph = styled.p`
  font-size: var(--font-size-s);
  font-weight: 300;

  &:not(:last-child) {
    margin-bottom: 2rem;
  }
`;
export const Small = styled.small`
  color: var(--color-blue-gray-65);
  font-size: var(--font-size-xs);
  font-weight: 300;
`;

export const Light = styled.span`
  font-weight: 300;
`;

export const Strong = styled.strong`
  font-weight: 700;
`;

export const Emphasize = styled.em``;

export const Underline = styled.u``;

export const Code = styled.code`
  height: 5rem;
  padding: 0 1.5rem;
  border: 0.125rem solid var(--color-blue-gray-40);
  border-radius: 1rem;
  background-color: var(--color-blue-gray-15);
  font-size: var(--font-size-xs);
  font-family: 'Courier Prime', sans-serif;
`;

export const BaseLink = styled(_Link)`
  max-width: 100%;
`;

export const TextLink = styled(BaseLink)`
  color: var(--color-blue-gray-60);

  &:hover {
    text-decoration: underline;
    color: var(--color-blue-gray-70);
  }
`;

export const Link = styled(BaseLink)`
  display: inline-block;
  color: var(--color-blue-65);
  text-decoration: underline;

  &:hover {
    color: var(--color-blue-70);
  }

  ${Tooltip} & {
    color: var(--color-white);
    text-decoration: underline;

    &:hover {
      color: var(--color-white);
    }
  }
`;

export const NavLink = styled(_NavLink)`
  display: inline-block;
`;
export const ExternalLink = styled(
  forwardRef<
    HTMLAnchorElement,
    StyledProps<{ keepReferrer?: boolean }> & HTMLProps<HTMLAnchorElement>
  >(({ keepReferrer, ...props }, ref) => (
    <a ref={ref} {...props} target="_blank" rel={keepReferrer ? null : 'noopener noreferrer'} />
  ))
)`
  display: inline-block;
  color: var(--color-blue-65);
  text-decoration: underline;

  &:hover {
    color: var(--color-blue-70);
  }

  ${Tooltip} & {
    color: var(--color-blue-45);

    &:hover {
      color: var(--color-blue-50);
    }
  }
`;

export const OrderedList = styled.ol`
  padding: 0 4rem;

  &:not(:last-child) {
    margin-bottom: 2rem;
  }
`;

export const UnorderedList = styled.ul`
  padding: 0 4rem;

  &:not(:last-child) {
    margin-bottom: 2rem;
  }
`;

export const ListItem = styled.li`
  &:not(:last-child) {
    margin-bottom: 2rem;
  }
`;

export const EllipsisText = styled.span`
  display: block;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export const LinesEllipsisText = styled.span<{ lines?: number }>`
  overflow: hidden;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${props => props.lines ?? 2}; /* number of lines to show */
`;
