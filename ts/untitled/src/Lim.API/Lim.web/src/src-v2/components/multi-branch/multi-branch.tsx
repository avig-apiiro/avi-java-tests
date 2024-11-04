import { observer } from 'mobx-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { DeleteButton } from '@src-v2/components/buttons';
import { Carousel } from '@src-v2/components/carousel';
import { Dropdown } from '@src-v2/components/dropdown';
import { Select } from '@src-v2/components/forms/select';
import { BaseIcon } from '@src-v2/components/icons';
import { Gutters } from '@src-v2/components/layout';
import { SuggestedCarouselItem } from '@src-v2/components/multi-branch/suggested-carousel-item';
import { BranchInsightsCell, LabelCell } from '@src-v2/components/multi-branch/table-cells';
import { Table } from '@src-v2/components/table/table';
import { TableHeader } from '@src-v2/components/table/table-header';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Heading, Paragraph } from '@src-v2/components/typography';
import { SelectInput } from '@src-v2/containers/select-input';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useTable } from '@src-v2/hooks/use-table';
import { MultiBranchProps } from '@src-v2/types/multi-branch';

export const MultiBranch = observer(
  ({ repositoryKey, maxMonitorSize, changedData, setChangedData }: MultiBranchProps) => {
    const { connectors, toaster } = useInject();
    const [monitoredBranches, setMonitoredBranches] = useState([]);
    const [suggestedBranches, setSuggestedBranches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const {
      defaultBranch,
      monitoredBranches: fetchedMonitored = [],
      suggestedBranches: fetchedSuggested = [],
    } = useSuspense(connectors.getProviderRepositoryData, {
      key: repositoryKey,
    });

    const tableColumns = useMemo(
      () => [
        {
          key: 'name',
          label: 'Branch name',
          width: '40%',
          Cell: ({ data, ...props }) => (
            <Table.FlexCell {...props}>{decodeURIComponent(data.name)}</Table.FlexCell>
          ),
        },
        {
          key: 'label',
          width: '40%',
          label: (
            <LabelCellHeaderContainer>
              Label{' '}
              <InfoTooltip
                content={
                  <LabelTooltipContent>
                    Add labels to filter and search by.{'\n'}These labels do not affect your source
                    control.
                  </LabelTooltipContent>
                }
              />
            </LabelCellHeaderContainer>
          ),
          Cell: ({ data, ...props }) => (
            <LabelCell
              {...props}
              branch={data}
              changedData={changedData}
              setChangedData={setChangedData}
            />
          ),
        },
        {
          key: 'insights',
          width: '20%',
          label: 'Insights',
          Cell: ({ data, ...props }) => (
            <BranchInsightsCell
              {...props}
              branch={data}
              changedData={changedData}
              defaultBranch={defaultBranch}
              monitoredBranches={monitoredBranches}
              suggestedBranches={suggestedBranches}
              setChangedData={setChangedData}
              setSuggestedBranches={setSuggestedBranches}
              setMonitoredBranches={setMonitoredBranches}
            />
          ),
        },
      ],
      [
        changedData,
        defaultBranch,
        monitoredBranches,
        suggestedBranches,
        setChangedData,
        setSuggestedBranches,
        setMonitoredBranches,
      ]
    );

    useEffect(() => {
      setMonitoredBranches(
        fetchedMonitored.map(monitored => ({
          ...monitored,
          ...(fetchedSuggested.find(branch => branch.branchName === monitored.name) ?? {}),
        }))
      );
      setSuggestedBranches(
        fetchedSuggested
          ?.map(branch => ({ ...branch, name: branch.branchName }))
          .filter(branch => !fetchedMonitored.find(({ name }) => branch.name === name))
      );
    }, [connectors]);

    const handleBranchMonitor = useCallback(
      async (branchName, isSuggested = false) => {
        if (branchName) {
          setIsLoading(true);
          try {
            const { key, tag } = await connectors.getBranchMonitor({
              key: repositoryKey,
              name: branchName,
            });

            // update changed data
            const currentChange = { ...changedData };
            if (currentChange.branchesToUnmonitor.includes(branchName)) {
              currentChange.branchesToUnmonitor = currentChange.branchesToUnmonitor.filter(
                branch => branch !== branchName
              );
            } else {
              currentChange.branchesToMonitor = [...currentChange.branchesToMonitor, branchName];
            }
            setChangedData(currentChange);

            const currentSuggested =
              suggestedBranches.find(branch => branch.name === branchName) ?? {};

            setMonitoredBranches([
              ...monitoredBranches,
              { key, name: branchName, label: tag, isSuggested, ...currentSuggested },
            ]);

            setSuggestedBranches(
              suggestedBranches.filter(suggested => suggested.name !== branchName)
            );
          } catch (error) {
            toaster.error('Failed to monitor branch. please try again');
          } finally {
            setIsLoading(false);
          }
        }
      },
      [
        connectors,
        monitoredBranches,
        setMonitoredBranches,
        suggestedBranches,
        setSuggestedBranches,
        changedData,
        setChangedData,
      ]
    );

    const handleSearchBranches = useSearchBranches(repositoryKey, monitoredBranches);
    const tableModel = useTable({ tableColumns, hasReorderColumns: false });

    return (
      <Container>
        <Section>
          <Paragraph>
            Choose up to {maxMonitorSize} branches to monitor. Each monitored branch has its own
            risk profile.
          </Paragraph>
        </Section>
        <Section>
          <Table>
            <TableHeader tableModel={tableModel} />
            <Table.Body>
              <SearchRow>
                <Tooltip
                  placement="left-start"
                  content={`Only ${maxMonitorSize} branches can be monitored`}
                  disabled={monitoredBranches.length < maxMonitorSize}>
                  {/* @ts-expect-error */}
                  <Table.DropdownCell colSpan={tableColumns.length}>
                    <BranchInput
                      // @ts-expect-error
                      expandable
                      wait={400}
                      disabled={monitoredBranches.length >= maxMonitorSize}
                      clearable={false}
                      placeholder="Add branches"
                      searchMethod={handleSearchBranches}
                      itemToString={item => item?.name}
                      onSelect={event => handleBranchMonitor(event.selectedItem?.name)}
                      noSelectedPlaceholder
                    />
                  </Table.DropdownCell>
                </Tooltip>
              </SearchRow>
              {monitoredBranches.map(branch => (
                <Table.Row key={branch.name}>
                  {tableModel.columns?.map(({ Cell, ...column }) => (
                    <Cell key={column.label} data={branch} />
                  ))}
                </Table.Row>
              ))}
              {isLoading && (
                <Table.EmptyMessage colSpan={tableColumns.length}>
                  <LogoSpinner />
                </Table.EmptyMessage>
              )}
            </Table.Body>
          </Table>
        </Section>
        {suggestedBranches.length > 0 && (
          <SmallGapSection>
            <Paragraph>Suggested branches to monitor</Paragraph>
            <Carousel slidesToShow={3}>
              {suggestedBranches.map(branch => (
                <SuggestedCarouselItem
                  key={branch.name}
                  {...branch}
                  monitorDisabled={monitoredBranches.length >= maxMonitorSize}
                  onClick={() => handleBranchMonitor(branch.name, true)}
                  maxMonitorSize={maxMonitorSize}
                />
              ))}
            </Carousel>
          </SmallGapSection>
        )}
      </Container>
    );
  }
);

const SearchRow = styled(Table.Row)`
  ${Table.Body} > &:hover ${Table.Cell} {
    background-color: var(--color-white);
  }
`;

const LabelTooltipContent = styled.span`
  white-space: pre-wrap;
`;

const Container = styled(Gutters)`
  display: flex;
  flex-direction: column;
  gap: 8rem;

  ${Heading} {
    font-size: var(--font-size-xxl);
    font-weight: 600;
    margin: 0;
  }

  ${Paragraph} {
    margin: 0;
  }

  ${LogoSpinner} {
    width: 5rem;
    height: 5rem;
  }

  ${Table.Row} {
    &:first-of-type:hover {
      background-color: unset;
    }

    ${DeleteButton} {
      visibility: hidden;
    }

    &:hover {
      ${DeleteButton} {
        visibility: visible;
      }
    }
  }
`;

const LabelCellHeaderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6rem;
`;

const SmallGapSection = styled(Section)`
  gap: 4rem;

  ${Carousel} {
    --carousel-item-size: 100rem;
  }
`;

const BranchInput = styled(SelectInput)`
  ${BaseIcon} {
    color: var(--color-white);
    border-radius: 100vmax;
    background-color: var(--color-blue-gray-70);
  }

  ${Select.SelectIconButton} {
    display: none;
  }

  ${Dropdown.List} {
    max-width: 100rem;
  }
`;

function useSearchBranches(repositoryKey, monitoredBranches) {
  const { connectors, toaster, asyncCache } = useInject();

  return useCallback(
    async ({ searchTerm }) => {
      try {
        const fetchedBranches = await asyncCache.suspend(connectors.getProviderRepositoryBranches, {
          key: repositoryKey,
          searchTerm,
          pageSize: 100,
          startPage: 0,
        });
        return fetchedBranches.filter(
          branch => !monitoredBranches.some(monitored => monitored.name === branch.name)
        );
      } catch (error) {
        if (error.response?.status === 400 && error.response.data?.code === 'RateLimit') {
          toaster.error(
            `Rate limit exceeded for github access.${
              error.data?.message ? ` Need to wait another ${error.data.message} minutes` : ''
            }`
          );
          return;
        }
        toaster.error('Something went wrong');
      }
    },
    [repositoryKey, monitoredBranches]
  );
}
