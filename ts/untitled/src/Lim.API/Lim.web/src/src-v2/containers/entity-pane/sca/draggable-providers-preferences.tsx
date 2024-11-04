import { useCallback, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import styled from 'styled-components';
import { CircleIcon } from '@src-v2/components/circle-icon';
import { SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { getProviderDisplayName } from '@src-v2/data/providers';
import { Provider } from '@src-v2/types/enums/provider';

export const DraggableProvidersPreferences = ({
  providers,
  onChange,
}: {
  providers: Provider[];
  onChange?: (providers: Provider[]) => void;
}) => {
  const [availableServers, setAvailableServers] = useState(providers);

  const moveItem = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragItem = availableServers[dragIndex];
      const hoverItem = availableServers[hoverIndex];
      const newArray = [...availableServers];
      newArray[dragIndex] = hoverItem;
      newArray[hoverIndex] = dragItem;

      if (hoverIndex >= 0 && hoverIndex < availableServers.length) {
        setAvailableServers(newArray);
        onChange?.(newArray);
      }
    },
    [availableServers]
  );

  return (
    <DraggableSection>
      {availableServers.map((row, index) => (
        <DraggableRow
          key={index}
          row={row}
          index={index}
          downDisabled={index === availableServers.length - 1}
          upDisabled={index === 0}
          moveItem={moveItem}
        />
      ))}
    </DraggableSection>
  );
};

const DraggableRow = ({ row, index, upDisabled, downDisabled, moveItem }) => {
  const onDrop = useCallback(
    ({ key }) => {
      if (key !== index) {
        moveItem(key, index);
      }
    },
    [index, row]
  );

  const [, drag] = useDrag({
    type: 'provider',
    item: { key: index },
  });

  const [, drop] = useDrop({
    accept: 'provider',
    drop: onDrop,
  });

  return (
    <RowWrapper ref={node => drag(drop(node))}>
      <DragPart>
        <span>{index + 1}</span>
        <>
          <SvgIcon name="Drag" />
          <VendorIcon name={row} />
          {getProviderDisplayName(row)}
        </>
      </DragPart>
      <OrderArrows
        index={index}
        upDisabled={upDisabled}
        downDisabled={downDisabled}
        moveItem={moveItem}
      />
    </RowWrapper>
  );
};

const OrderArrows = ({ downDisabled, upDisabled, index, moveItem }) => (
  <CenteredFlex>
    <CircleIcon
      variant={Variant.TERTIARY}
      disabled={upDisabled}
      size={Size.LARGE}
      icon="ArrowUp"
      onClick={() => moveItem(index, index - 1)}
    />
    <CircleIcon
      variant={Variant.TERTIARY}
      disabled={downDisabled}
      size={Size.LARGE}
      icon="ArrowDown"
      onClick={() => moveItem(index, index + 1)}
    />
  </CenteredFlex>
);

const CenteredFlex = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const DragPart = styled(CenteredFlex)`
  display: flex;
  align-items: center;
  gap: 2rem;

  span {
    font-size: var(--font-size-s);
    line-height: 5rem;
  }
`;

const RowWrapper = styled(CenteredFlex)`
  justify-content: space-between;
  cursor: grab;
  border-radius: 8px;

  :hover {
    background: var(--color-blue-gray-15);
  }

  &:active {
    padding: 0 2rem;
    cursor: grabbing;
    border-radius: 8px;
    background: var(--color-blue-gray-20);
    box-shadow:
      0 0 1rem 0 rgba(1, 32, 112, 0.14),
      0 0 3rem 0.5rem rgba(1, 32, 112, 0.12);
  }
`;

const DraggableSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;
