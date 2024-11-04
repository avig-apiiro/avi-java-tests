import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import { ReactMarkdownProps } from 'react-markdown/lib/ast-to-react';
import { PluggableList } from 'react-markdown/lib/react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import styled from 'styled-components';
import {
  ExternalLink,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  ListItem,
  OrderedList,
  Paragraph,
  UnorderedList,
} from '@src-v2/components/typography';
import { createLinkFromPageRoute } from '@src-v2/data/declarative-page-routes';
import { StyledProps } from '@src-v2/types/styled';

export enum ComponentsMapStyle {
  default = 'default',
  description = 'description',
}

export const Markdown = ({
  children,
  componentsMapStyle = ComponentsMapStyle.default,
  ...props
}: Omit<StyledProps, 'children'> & {
  children: string;
  componentsMapStyle?: ComponentsMapStyle;
}) => {
  // @ts-expect-error
  const rehypePlugins: PluggableList = [rehypeRaw, rehypeSanitize];

  return (
    <ReactMarkdown
      {...props}
      components={
        componentsMapStyle === ComponentsMapStyle.default
          ? defaultComponentsMap
          : descriptionComponentsMap
      }
      transformLinkUri={uriTransformer}
      rehypePlugins={rehypePlugins}>
      {children}
    </ReactMarkdown>
  );
};

const LiItem: FC<ReactMarkdownProps & { ordered: boolean }> = ({ children, ordered }) => (
  <ListItem style={{ listStyleType: ordered ? 'decimal' : 'disc' }}>{children}</ListItem>
);

const DefaultParagraph = styled.p`
  font-weight: 400;
`;

const defaultComponentsMap: { [tag: string]: FC<any> } = {
  p: Paragraph,
  a: ExternalLink,
  ul: UnorderedList,
  ol: OrderedList,
  h1: Heading3,
  h2: Heading4,
  h3: Heading5,
  h4: Heading6,
  li: LiItem,
};

const descriptionComponentsMap: { [tag: string]: FC<any> } = {
  p: DefaultParagraph,
  a: ExternalLink,
  ul: UnorderedList,
  ol: OrderedList,
  h1: Heading4,
  h2: Heading5,
  h3: Heading6,
  h4: Heading6,
  li: LiItem,
};

const validUris = /^((https?|mailto):\/)?\//;

function uriTransformer(uri = '') {
  return validUris.test(uri) ? uri.trim() : createLinkFromPageRoute(uri.trim());
}
