import { ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { ExternalLink } from '@src-v2/components/typography';
import { ThenType } from '@src-v2/containers/workflow/types/types';

const tooltipContent: Partial<Record<ThenType, ReactNode>> = {
  BuildReportViolations: (
    <>
      This requires special settings in your SCM, read more{' '}
      <ExternalLink href="https://docs.apiiro.com/for/buildsScan">here</ExternalLink>
    </>
  ),
  FailPullRequest: (
    <>
      This requires special settings in your SCM, read more{' '}
      <ExternalLink href="https://docs.apiiro.com/for/buildsScan">here</ExternalLink>
    </>
  ),
  Webhook: 'For authentication use the Authorization Header configuration',
  Questionnaire: 'Apiiro will add a comment to the issue with a link to the questionnaire',
};

export const ThenTypeInfoTooltip = styled(({ type, ...props }: { type: ThenType }) => {
  const { watch } = useFormContext();

  if (watch('isReadonly')) {
    return null;
  }

  if (!tooltipContent[type]) {
    return null;
  }

  return (
    <div {...props}>
      <InfoTooltip interactive content={tooltipContent[type]} appendTo={document.body} />
    </div>
  );
})`
  display: flex;
  align-items: center;

  ${ExternalLink} {
    color: white;
  }
`;
