import { ForwardedRef, forwardRef } from 'react';
import styled from 'styled-components';
import { Circle, CircleGroup } from '@src-v2/components/circles/index';
import { LanguageCircle } from '@src-v2/components/circles/language-circle';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { TrimmedCollectionDisplay } from '@src-v2/components/trimmed-collection-display';
import { Size } from '@src-v2/components/types/enums/size';

interface Language {
  name: string;
  icon: string;
  tooltip?: string;
}

interface LanguageStackProps {
  languages: Language[];
  limit?: number;
  size?: Size;
  showMore?: boolean;
}

export const LanguageStack = ({ languages, limit = 3, size = Size.SMALL }: LanguageStackProps) => (
  <CircleGroup size={size}>
    <TrimmedCollectionDisplay<Language>
      limit={limit}
      item={({ value: language, index }) => (
        <Tooltip content={language.tooltip ?? language.name}>
          <LanguageCircle name={language.icon ?? language.name} zIndex={languages.length - index} />
        </Tooltip>
      )}
      excessiveItem={ExcessiveItem}
      counter={forwardRef((props, ref: ForwardedRef<any>) => (
        <MoreCircle {...props} ref={ref} zIndex={languages.length - limit} />
      ))}>
      {languages}
    </TrimmedCollectionDisplay>
  </CircleGroup>
);

const ExcessiveItem = forwardRef<HTMLDivElement, { value: Language }>(
  ({ value: language }, ref) => <div ref={ref}>{language.tooltip ?? language.name}</div>
);

const MoreCircle = styled(Circle)`
  background-color: var(--color-blue-30);
  border: 0.4rem solid var(--color-white);
`;
