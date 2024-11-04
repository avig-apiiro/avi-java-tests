import { MouseEvent } from 'react';
import styled from 'styled-components';
import { ClampPath } from '@src-v2/components/clamp-text';
import { ExternalLink } from '@src-v2/components/typography';
import { generateCodeReferenceUrl } from '@src-v2/data/connectors';
import { LeanConsumableProfile } from '@src-v2/types/profiles/lean-consumable-profile';
import { CodeReference } from '@src-v2/types/risks/code-reference';
import { StyledProps } from '@src-v2/types/styled';

export const CodeReferenceLink = styled(
  ({
    repository,
    codeReference,
    lines,
    url,
    showLineNumber = false,
    showLineNumberInLink = true,
    children,
    ...props
  }: StyledProps<{
    repository: Pick<LeanConsumableProfile, 'url' | 'vendor' | 'referenceName'>;
    codeReference: CodeReference;
    lines?: number;
    showLineNumber?: boolean;
    showLineNumberInLink?: boolean;
    url?: string;
    onClick?: (e: MouseEvent<HTMLElement>) => void;
  }>) => {
    return (
      <ExternalLink
        {...props}
        href={
          url !== undefined
            ? url
            : generateCodeReferenceUrl(repository, codeReference, showLineNumberInLink)
        }>
        <ClampPath lines={lines}>
          {`${codeReference.relativeFilePath} ${showLineNumber ? `#Line${codeReference.lineNumber}` : ''}`}
        </ClampPath>
        {children}
      </ExternalLink>
    );
  }
)`
  width: 100%;
  overflow: hidden;
`;
