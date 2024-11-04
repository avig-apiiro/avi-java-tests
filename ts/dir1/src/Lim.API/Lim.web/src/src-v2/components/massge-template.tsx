import styled from 'styled-components';
import { Circle } from '@src-v2/components/circles';
import { Time } from '@src-v2/components/time';
import { Strong } from '@src-v2/components/typography';
import { assignStyledNodes } from '@src-v2/types/styled';

const _MessageTemplate = styled.div`
  display: grid;
  padding: 4rem;
  grid-template-areas:
    'icon header'
    'icon content';
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  grid-column-gap: 2rem;
  border-radius: 3rem;
  background-color: var(--color-blue-gray-15);

  > ${Circle} {
    grid-area: icon;
    background-color: var(--color-white);
  }
`;

const Head = styled.header`
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 3rem;

  ${Time} {
    color: var(--color-blue-gray-55);
    font-size: var(--font-size-xs);
  }

  ${Strong} {
    font-size: var(--font-size-s);
  }
`;

const Body = styled.article`
  grid-area: content;
  display: flex;
  flex-direction: column;
  gap: 4rem;
`;

const Foot = styled.footer`
  font-size: var(--font-size-xs);
`;

const BlockQuote = styled.blockquote`
  display: block;
  padding-left: 2rem;
  border-left: 0.5rem solid var(--color-blue-gray-30);
`;

const Heading = styled.div``;

const Link = styled.span`
  color: var(--color-purple-50);
`;

const Tag = styled.span`
  padding: 0.25rem 0.5rem;
  font-size: var(--font-size-xxs);
  font-weight: 500;
  background-color: var(--color-blue-gray-25);
`;

export const MessageTemplate = assignStyledNodes(_MessageTemplate, {
  Head,
  Body,
  Foot,
  BlockQuote,
  Heading,
  Link,
  Tag,
});
