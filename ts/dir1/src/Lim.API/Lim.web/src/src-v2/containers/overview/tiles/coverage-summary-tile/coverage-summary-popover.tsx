import _ from 'lodash';
import isEmpty from 'lodash/isEmpty';
import { ReactElement } from 'react';
import styled from 'styled-components';
import { ActivityIndicator } from '@src-v2/components/activity-indicator';
import { TextButton } from '@src-v2/components/button-v2';
import { ConditionalProviderIcon, VendorIcon } from '@src-v2/components/icons';
import { useOverviewFilters } from '@src-v2/components/overview/use-overview-filters';
import { hideOthersOnOpenPlugin } from '@src-v2/components/tooltips/hide-on-others-open-plugin';
import { Popover } from '@src-v2/components/tooltips/popover';
import { Size } from '@src-v2/components/types/enums/size';
import { Heading4 } from '@src-v2/components/typography';
import { getCoverageOverviewFilters } from '@src-v2/containers/overview/tiles/utils';
import { apiiroProviderNames } from '@src-v2/services';
import { makeUrl } from '@src-v2/utils/history-utils';
import { formatNumber } from '@src-v2/utils/number-utils';

type CoverageValue = {
  total: number;
  repositoriesCount: string;
  percentage: string;
  providerDisplayName: string;
};

interface CoverageProviderPopoverProps {
  coverageValue: CoverageValue;
  provider: string;
  children: ReactElement;
  totalCoverages: number;
}

interface CoverageSummaryPopoverProps {
  coverageValues: Record<string, CoverageValue & { total: { total: number; percentage: number } }>;
  coverageGroupDisplayName: string;
  totalCoverages: number;
  children: ReactElement;
}

export function CoverageSummaryPopover({
  coverageValues,
  totalCoverages,
  coverageGroupDisplayName,
  ...props
}: CoverageSummaryPopoverProps) {
  const vendors = Object.keys(_.omit(coverageValues, 'total')).filter(value => value !== 'total');
  const { total: groupCoverageCount } = coverageValues.total;

  if (isEmpty(coverageValues)) {
    return <>{props.children}</>;
  }

  return (
    <CoverageTilePopover
      {...props}
      placement="right"
      plugins={[hideOthersOnOpenPlugin]}
      trigger="mouseenter mouseover"
      noDelay
      content={
        <>
          <CoveragePopoverTitle>{coverageGroupDisplayName} coverage</CoveragePopoverTitle>
          <ScanStatusSection vendors={vendors} scannedValue={formatNumber(groupCoverageCount)} />
          <SectionDivider />
          {vendors.map(vendor => (
            <VendorDetailsSection
              key={vendor}
              vendorKey={vendor}
              vendorDisplayName={coverageValues[vendor].providerDisplayName}
              label={`${formatNumber(coverageValues[vendor].total)} repositories (${
                coverageValues[vendor].percentage
              }%)`}
            />
          ))}
        </>
      }
    />
  );
}

export function CoverageProviderPopover({
  coverageValue,
  totalCoverages,
  provider,
  ...props
}: CoverageProviderPopoverProps) {
  return (
    <CoverageTilePopover
      plugins={[hideOthersOnOpenPlugin]}
      trigger="mouseenter mouseover"
      noDelay
      {...props}
      content={
        <>
          <VendorHeading>
            <VendorIcon size={Size.XSMALL} name={getVendorName(provider)} />{' '}
            {coverageValue.providerDisplayName} {coverageValue.percentage}%
          </VendorHeading>

          <ScanStatusSection
            provider={provider}
            scannedValue={formatNumber(coverageValue.total)}
            notScannedValue={formatNumber(totalCoverages - coverageValue.total)}
          />
        </>
      }
    />
  );
}

const ScanStatusSection = styled(
  ({ provider, scannedValue, notScannedValue, vendors, ...props }) => {
    const { activeFilters: dashboardFilters } = useOverviewFilters();
    return (
      <div {...props}>
        <ScanStatus>
          <IconLabelContainer>
            <ActivityIndicator active={true} />
            Scanned
          </IconLabelContainer>
          <TextButton
            showArrow
            to={makeUrl('/coverage', {
              fl: {
                RepositoryMonitorStatus: { values: ['Monitored'] },
                MatchedProviders: { values: vendors ?? [provider] },
                ...getCoverageOverviewFilters(dashboardFilters),
              },
            })}>
            {scannedValue} repositories
          </TextButton>
        </ScanStatus>
        {(notScannedValue || notScannedValue === 0) && (
          <ScanStatus>
            <IconLabelContainer>
              <ActivityIndicator active={false} />
              Not Scanned
            </IconLabelContainer>
            <TextButton
              showArrow
              to={makeUrl('/coverage', {
                fl: {
                  RepositoryMonitorStatus: { values: ['Monitored'] },
                  UnmatchedProviders: { values: vendors ?? [provider] },
                  ...getCoverageOverviewFilters(dashboardFilters),
                },
              })}>
              {notScannedValue} repositories
            </TextButton>
          </ScanStatus>
        )}
      </div>
    );
  }
)`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  ${ActivityIndicator} {
    background-color: var(--color-blue-40);

    &[data-active] {
      background-color: var(--color-blue-70);
    }


`;

const VendorDetailsSection = ({
  vendorKey,
  vendorDisplayName,
  label,
}: {
  vendorKey: string;
  vendorDisplayName: string;
  label: string;
}) => (
  <VendorDetails key={vendorKey}>
    <IconLabelContainer>
      <ConditionalProviderIcon size={Size.XSMALL} name={getVendorName(vendorKey)} />
      {vendorDisplayName}
    </IconLabelContainer>
    {label}
  </VendorDetails>
);

const getVendorName = (vendor: string) => {
  if (apiiroProviderNames.includes(vendor)) {
    return 'Apiiro';
  }
  return vendor;
};

const CoverageTilePopover = styled(Popover)`
  overflow: visible;
  position: relative;

  &:after {
    /*   this is a "mouse catcher" that prevents the nested popover from hiding when trying to interact with it*/
    content: '';
    position: absolute;
    height: 3rem;
    width: 100%;
  }
`;

const VendorDetails = styled.div`
  margin-top: 3rem;
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-s);
`;

const IconLabelContainer = styled.div`
  font-size: var(--font-size-s);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ScanStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SectionDivider = styled.div`
  margin: 3rem 0;
  border-bottom: 0.25rem solid var(--color-blue-gray-20);
`;

const CoveragePopoverTitle = styled(Heading4)`
  margin-bottom: 3rem;
`;

const VendorHeading = styled(Heading4)`
  display: flex;
  margin: 2rem 0 4rem 0;
  gap: 2rem;
`;
