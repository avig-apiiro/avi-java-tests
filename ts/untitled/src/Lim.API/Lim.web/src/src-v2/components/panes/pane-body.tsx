import styled from 'styled-components';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { Banner } from '@src-v2/components/banner';
import { Card } from '@src-v2/components/cards';
import { Collapsible } from '@src-v2/components/collapsible';
import { CollapsibleLite } from '@src-v2/components/collapsible-lite';
import { Divider } from '@src-v2/components/divider';
import { FlexibleBoundary } from '@src-v2/components/layout';
import { Table } from '@src-v2/components/table/table';
import { Heading, Paragraph } from '@src-v2/components/typography';
import { customScrollbar } from '@src-v2/style/mixins';

export const PaneBody = styled.div`
  --card-padding: 4rem;

  display: flex;
  padding: 0 4rem;
  flex-grow: 1;
  flex-direction: column;

  ${customScrollbar};

  ${Card} {
    margin-bottom: 4rem;
    font-size: var(--font-size-s);

    ${Heading}, ${Paragraph} {
      &:not(:last-child) {
        margin-bottom: 4rem;
      }
    }

    ${CollapsibleLite.Button} {
      margin-bottom: -1rem;
    }

    ${CollapsibleLite.Body} ${Divider}:not([data-vertical]) {
      margin: 4rem 0 2rem;
    }
  }

  ${Banner} {
    padding: 4rem 5rem;
    margin: 0 0 4rem;
  }

  ${FlexibleBoundary} ${LogoSpinner} {
    width: 10rem;
    height: 10rem;
    margin-top: 4rem;
  }

  ${Table} {
    ${Table.Header} {
      padding-right: 2rem;

      &:first-child {
        padding-left: 4rem;
      }

      &:last-child {
        padding-right: 6rem;
      }
    }

    ${Table.Body} ${Table.Cell} {
      padding: 2rem;
      font-size: var(--font-size-xs);

      &:first-child {
        padding-left: 4rem;
      }
    }
  }

  ${(Table as any).Header} {
    font-weight: 400;
  }
`;

export const CardTitle = styled(Collapsible.Title)`
  margin-bottom: 4rem;
  font-size: var(--font-size-m);
`;
