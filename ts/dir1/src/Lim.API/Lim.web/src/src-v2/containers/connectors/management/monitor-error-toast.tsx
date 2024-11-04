import _ from 'lodash';
import { Fragment } from 'react';
import styled from 'styled-components';
import { ToastParagraph } from '@src-v2/components/toastify';
import { Heading, ListItem, UnorderedList } from '@src-v2/components/typography';

export function MonitorErrorToast({
  irrelevantRepositoriesByStatus,
  maxSamples = 5,
}: {
  irrelevantRepositoriesByStatus: Record<string, any>;
  maxSamples?: number;
}) {
  const repositoriesCount = Object.values(irrelevantRepositoriesByStatus).flat().length;
  return (
    <>
      <Heading>{repositoriesCount} items couldn't be monitored</Heading>
      {Object.entries(irrelevantRepositoriesByStatus).map(([status, repositories]) => (
        <Fragment key={status}>
          <ToastParagraph>
            The following items were not monitored since they{' '}
            {{
              TooLarge: 'require too much disk space or resources',
              Unreachable: 'are unreachable',
              KeyTooLong: 'are unreachable',
            }[status] ?? 'unknown'}
          </ToastParagraph>
          <List>
            {_.sortBy(repositories, 'name')
              .slice(0, maxSamples)
              .map(repository => (
                <ListItem key={repository.key}>{repository.name}</ListItem>
              ))}
          </List>
        </Fragment>
      ))}
    </>
  );
}

const List = styled(UnorderedList)`
  ${ListItem} {
    font-weight: 300;

    &:not(:last-child) {
      margin-bottom: 1rem;
    }
  }
`;
