import _ from 'lodash';
import styled from 'styled-components';
import { TextButton } from '@src-v2/components/button-v2';
import { HtmlMarkdown } from '@src-v2/components/html-markdown';
import { ComponentsMapStyle } from '@src-v2/components/markdown';
import { Paragraph } from '@src-v2/components/typography';
import { useToggle } from '@src-v2/hooks';

export const ExpandableDescription = styled(
  ({
    children,
    maxPreviewChars = 160,
    ...props
  }: {
    children: string;
    maxPreviewChars?: number;
  }) => {
    const [showFullText, toggleShowFullText] = useToggle(false);

    const previewText = showFullText
      ? children
      : _.truncate(children, { length: maxPreviewChars, separator: /,?\.* +/ });

    return (
      <ExpandableParagraph {...props}>
        <HtmlMarkdown componentsMapStyle={ComponentsMapStyle.description}>
          {previewText}
        </HtmlMarkdown>
        {children.length > maxPreviewChars && (
          <TextButton onClick={toggleShowFullText} underline>
            <ShowMoreText>{showFullText ? 'Show less' : 'Show more...'}</ShowMoreText>
          </TextButton>
        )}
      </ExpandableParagraph>
    );
  }
)`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  p {
    display: inline;
  }

  pre {
    overflow: auto;
  }

  h2 {
    margin-top: 2rem;
    font-size: var(--font-size-s);
    font-weight: 600;
  }
`;

const ExpandableParagraph = styled(Paragraph)`
  display: inline;
`;

const ShowMoreText = styled.span`
  font-size: var(--font-size-xs);
  font-weight: 400;
`;
