import { ReactNode } from 'react';
import styled from 'styled-components';
import { Counter } from '@src-v2/components/counter';
import { FilterOption } from '@src-v2/hooks/use-filters';

interface FilterPlaceholderProps {
  label: string;
  valuesCount: number;
  activeValues?: FilterOption[];
  renderItem: (activeValue) => ReactNode;
}

export const FilterPlaceholder = ({
  label,
  valuesCount,
  activeValues,
  renderItem,
}: FilterPlaceholderProps) => {
  return (
    <PlaceHolderWrapper>
      <PlaceHolderLabelWrapper>
        <span>{label}</span>
        {valuesCount > 0 && (
          <PlaceHolderLabelWrapper>
            :<ActiveValueText>{renderItem?.(activeValues?.[0])}</ActiveValueText>
          </PlaceHolderLabelWrapper>
        )}
      </PlaceHolderLabelWrapper>
      {valuesCount > 1 && <Counter>+{valuesCount - 1}</Counter>}
    </PlaceHolderWrapper>
  );
};

const PlaceHolderWrapper = styled.div`
  display: flex;
  gap: 1rem;
`;

const PlaceHolderLabelWrapper = styled.div`
  display: flex;
  overflow: hidden;
`;

const ActiveValueText = styled.span<{ onClose?: any }>`
  max-width: 32rem;
  text-overflow: ellipsis;
  overflow: hidden;
  align-items: center;
  gap: 1rem;
  font-weight: 600;
  margin-left: 1rem;
`;
