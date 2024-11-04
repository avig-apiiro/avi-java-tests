import styled from 'styled-components';
import { Circle } from '@src-v2/components/circles';
import { TextareaControl } from '@src-v2/components/forms/form-controls';
import { SvgIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Paragraph, Title } from '@src-v2/components/typography';

export const IgnoreRepositoryForm = ({
  repository,
  maxLength = 80,
  rows = 3,
  isBulkAction,
}: {
  repository?: any;
  maxLength?: number;
  rows?: number;
  isBulkAction?: boolean;
}) => {
  const formTitle = isBulkAction
    ? 'Ignore Selected Repositories?'
    : repository?.isMonitored
      ? 'Ignore Monitored Repository?'
      : 'Ignore Repository?';
  const formDescription = isBulkAction
    ? 'repositories will be unmonitored and marked as not relevant for tracking. '
    : `${repository?.name} repository will be unmonitored and marked as not relevant for tracking.`;

  return (
    <Container>
      <Circle size={Size.XLARGE}>
        <SvgIcon name="Invisible" />
      </Circle>
      <Title>{formTitle}</Title>
      <Paragraph>{formDescription}</Paragraph>
      <Paragraph>You can always un-ignore this repository.</Paragraph>
      <TextareaControl
        name="ignoreReason"
        placeholder="Add Reason..."
        charLimit={maxLength}
        rows={rows}
      />
    </Container>
  );
};

const Container = styled.div`
  text-align: center;

  ${Circle} {
    margin: 0 auto 3rem;
  }

  ${Title} {
    font-size: var(--font-size-xl);
  }

  ${Paragraph} {
    color: var(--color-blue-gray-65);
  }
`;
