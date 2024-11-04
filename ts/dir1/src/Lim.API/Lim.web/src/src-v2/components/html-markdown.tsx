import styled from 'styled-components';
import { ComponentsMapStyle, Markdown } from '@src-v2/components/markdown';

export const HtmlMarkdown = styled(
  ({
    children,
    componentsMapStyle,
    ...props
  }: {
    children: string;
    componentsMapStyle?: ComponentsMapStyle;
  }) => (
    <Markdown {...props} componentsMapStyle={componentsMapStyle}>
      {children}
    </Markdown>
  )
)`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 2rem;
`;
