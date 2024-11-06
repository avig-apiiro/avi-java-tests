import styled from 'styled-components';
import { CodeBadge } from '@src-v2/components/badges';
import { ClampText } from '@src-v2/components/clamp-text';
import { Table } from '@src-v2/components/table/table';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Paragraph, Small } from '@src-v2/components/typography';

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
  PUT = 'PUT',
  PATCH = 'PATCH',
  ANY = 'ANY',
}

export const EndpointCell = styled(
  ({
    relativeFilePath,
    httpMethod,
    httpRoute,
    ...props
  }: {
    relativeFilePath: string;
    httpMethod: string;
    httpRoute: string;
  }) => (
    <Table.CenterCell {...props}>
      <Small>
        <ClampText>{relativeFilePath}</ClampText>
      </Small>
      <Paragraph>
        <Tooltip disabled={httpMethod !== HttpMethod.ANY} content="Any HTTP method invoke this API">
          <CodeBadge size={Size.XSMALL}>{httpMethod}</CodeBadge>
        </Tooltip>
        <ClampText>{httpRoute}</ClampText>
      </Paragraph>
    </Table.CenterCell>
  )
)`
  flex-direction: column;
  gap: 1rem;

  ${Small} {
    width: 100%;
    font-size: var(--font-size-xs);
  }

  ${Paragraph} {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: flex-start;
    gap: 1rem;
  }
`;
