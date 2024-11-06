import styled from 'styled-components';
import { DeleteButton } from '@src-v2/components/buttons';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { assignStyledNodes } from '@src-v2/types/styled';

const _ArrayField = styled.div`
  display: flex;
  margin-bottom: 3rem;
  align-items: flex-start;
  gap: 3rem;
`;

const RemoveTooltipButton = styled(({ label, ...props }) => (
  <Tooltip content={label} placement="right">
    <DeleteButton {...props} />
  </Tooltip>
))`
  margin-top: 1.5rem;
`;

export const ArrayField = assignStyledNodes(_ArrayField, {
  RemoveTooltipButton,
});
