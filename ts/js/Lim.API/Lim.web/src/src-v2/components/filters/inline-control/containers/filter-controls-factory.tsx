import _ from 'lodash';
import styled from 'styled-components';
import { EventStatusIndicator, RiskStatusIndicator } from '@src-v2/components/activity-indicator';
import { BusinessImpactIndicator } from '@src-v2/components/business-impact-indictor';
import { LanguageCircle } from '@src-v2/components/circles/language-circle';
import { AssetCollectionKeysGroupedFilterSelect } from '@src-v2/components/filters/custom-filters/asset-collection-keys-grouped-filter-select';
import { CodeModuleFilterSelect } from '@src-v2/components/filters/custom-filters/code-module-filter-select';
import { OrgTeamsFilterSelect } from '@src-v2/components/filters/custom-filters/org-teams-filter-select';
import { RepositoryKeysGroupedFilterSelect } from '@src-v2/components/filters/custom-filters/repository-keys-grouped-filter-select';
import { GroupedFilterSelect } from '@src-v2/components/filters/inline-control/components/grouped-filter-select';
import { RemoteGroupedFilterSelect } from '@src-v2/components/filters/inline-control/components/remote-grouped-filter-select';
import { SingleValueFilter } from '@src-v2/components/filters/inline-control/components/single-value-filter';
import {
  DateRangeOptionFilter,
  FilterDateRangeOptions,
} from '@src-v2/components/filters/inline-control/containers/filter-date-range-options';
import {
  FilterGeneralSelect,
  FilterGeneralSelectProps,
} from '@src-v2/components/filters/inline-control/containers/filter-general-select';
import { HierarchyFilterGeneralSelect } from '@src-v2/components/filters/inline-control/containers/hierarchy-filter-general-select';
import { ConditionalProviderIcon, SvgIcon } from '@src-v2/components/icons';
import { Markdown } from '@src-v2/components/markdown';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { ValidityIcon, getValidityMapper } from '@src-v2/components/risk/risk-validity';
import { InsightTag } from '@src-v2/components/tags';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Size } from '@src-v2/components/types/enums/size';
import { EllipsisText } from '@src-v2/components/typography';
import { UsedInCodeIcon, mappedUsedInCode } from '@src-v2/containers/risks/sca/sca-table-content';
import { useInject } from '@src-v2/hooks';
import {
  ActiveFiltersData,
  Filter,
  UseFiltersReturnValue,
  isHierarchyFilterOption,
} from '@src-v2/hooks/use-filters';
import { BusinessImpact } from '@src-v2/types/enums/business-impact';
import { RiskStatus } from '@src-v2/types/enums/risk-level';

export type FilterSelectorsFactoryProps = {
  activeValues: ActiveFiltersData;
  filter: Filter;
  'data-test-marker': string;
  onChange?: UseFiltersReturnValue['updateFilters'];
  onOperatorChange?: UseFiltersReturnValue['updateFilterOperator'];
  onClear?: UseFiltersReturnValue['removeFilters'];
  onClose?: () => void;
};

export function FilterSelectorsFactory(props: FilterSelectorsFactoryProps) {
  const { risks } = useInject();

  switch (props.filter.key) {
    case 'OrgTeamProfileKey':
    case 'OrgTeam': {
      return <OrgTeamsFilterSelect {...props} />;
    }
    case 'ExcludeRiskInsights':
    case 'RiskInsights':
      return (
        <GroupedFilterSelect
          {...props}
          renderItem={option => (
            <InsightTagWrapper key={option.title}>
              <InsightTag
                insight={{
                  badge: option.title,
                  sentiment: option.sentiment,
                  description: option.description,
                }}
                disableTooltip
              />
              {option.description && (
                <InfoTooltip
                  interactive
                  appendTo={document.body}
                  content={<Markdown>{option.description}</Markdown>}
                />
              )}
            </InsightTagWrapper>
          )}
          renderPlaceholder={option => (
            <InsightInFiltersLine key={option.title}>
              <InsightTag
                insight={{
                  badge: option.title,
                  sentiment: option.sentiment,
                  description: option.description,
                }}
                disableTooltip
              />
            </InsightInFiltersLine>
          )}
        />
      );
    case 'BusinessImpact':
      return (
        <FilterGeneralSelect
          {...props}
          searchable={false}
          renderItem={option =>
            option.value !== 'None' && (
              <RenderItemWrapper>
                <BusinessImpactIndicator
                  businessImpact={BusinessImpact[option?.key?.toLowerCase()] ?? option?.value}
                />
                {option.value}
              </RenderItemWrapper>
            )
          }
        />
      );
    case 'RiskLevel':
      return (
        <FilterGeneralSelect
          {...props}
          searchable={false}
          renderItem={option => (
            <RenderItemWrapper>
              <RiskIcon riskLevel={option?.value} />
              {option?.title}
            </RenderItemWrapper>
          )}
        />
      );
    case 'RiskStatus':
      return (
        <FilterGeneralSelect
          {...props}
          searchable={false}
          renderItem={option => (
            <StatusContainer>
              <RiskStatusIndicator status={RiskStatus[option?.key] ?? option?.value} />
              {option?.title}
            </StatusContainer>
          )}
        />
      );
    case 'HealthEventStatus':
      return (
        <FilterGeneralSelect
          {...props}
          searchable={false}
          renderItem={option => (
            <StatusContainer>
              <EventStatusIndicator status={RiskStatus[option?.key] ?? option?.value} />
              {option?.title}
            </StatusContainer>
          )}
        />
      );
    case 'RiskLanguage':
    case 'CodeParsingLanguage':
      return (
        <FilterGeneralSelect
          {...props}
          searchable
          renderItem={option => (
            <RenderItemWrapper>
              <LanguageCircle name={option?.value} size={Size.XSMALL} />
              <EllipsisText>{option?.title}</EllipsisText>
            </RenderItemWrapper>
          )}
        />
      );
    case 'SecretValidity':
      return (
        <FilterGeneralSelect
          {...props}
          searchable={false}
          renderItem={option => (
            <RenderItemWrapper>
              <ValidityIcon
                data-type={option.value}
                name={getValidityMapper({ validity: option.value })?.icon}
              />
              <EllipsisText>{option.title}</EllipsisText>
            </RenderItemWrapper>
          )}
        />
      );
    case 'UsedInCode':
      return (
        <FilterGeneralSelect
          {...props}
          searchable={false}
          renderItem={option => (
            <RenderItemWrapper>
              <UsedInCodeIcon
                data-type={option.value}
                name={mappedUsedInCode()[option.value].icon}
              />
              {option.title}
            </RenderItemWrapper>
          )}
        />
      );
    case 'Location':
      return (
        <RemoteGroupedFilterSelect
          searchMethod={risks.searchLocationFilter}
          initSelectedOptions={risks.initLocationFilterOptions}
          {...props}
        />
      );
    case 'ModuleRepositoryAndRoot':
      return <CodeModuleFilterSelect filterKey="ModuleRepositoryAndRoot" {...props} />;
    case 'RemoteAssetCollectionKeys':
      return <AssetCollectionKeysGroupedFilterSelect {...props} filterKey="AssetCollectionKeys" />;
    case 'RepositoryKeys':
      return <RepositoryKeysGroupedFilterSelect filterKey="RepositoryKeys" {...props} />;
    case 'ArtifactDependencyType':
      return <ProvidersFilterSelect {...props} searchable fallback={<SvgIcon name="Unknown" />} />;
    case 'PackageManager':
    case 'Platform':
    case 'CoveredProviders':
    case 'UnmatchedProviders':
    case 'MatchedProviders':
    case 'ArtifactSourceProviders':
    case 'Provider':
      return <ProvidersFilterSelect {...props} searchable />;
    case 'SecretHash':
      return (
        <SingleValueFilter
          {...props}
          filter={{ ...props.filter, title: 'Secrets with digest' }}
          formatValue={value => `#${value}`}
        />
      );
    case 'DependencyName':
    case 'Endpoint':
    case 'Component':
      return <SingleValueFilter {...props} formatValue={value => String(value)} />;
    case 'Discovered':
      return (
        <>
          <FilterDateRangeOptions {...props} filter={props.filter as DateRangeOptionFilter} />
        </>
      );

    case 'DueDate':
      return (
        <FilterDateRangeOptions
          {...props}
          filter={props.filter as DateRangeOptionFilter}
          presetsType="future"
        />
      );
    // no default
  }

  if (props.filter.isGrouped) {
    return <GroupedFilterSelect {...props} />;
  }

  switch (props.filter.type) {
    case 'checkbox': {
      if (filterIsHierarchical(props.filter)) {
        return <HierarchyFilterGeneralSelect {...props} />;
      }
      return <FilterGeneralSelect {...props} />;
    }

    case 'text':
      return <SingleValueFilter {...props} />;

    case 'dateRange':
      return <FilterDateRangeOptions {...props} filter={props.filter as DateRangeOptionFilter} />;

    default:
      return null;
  }
}

const ProvidersFilterSelect = ({
  searchable = false,
  fallback,
  ...props
}: FilterGeneralSelectProps) => (
  <FilterGeneralSelect
    {...props}
    searchable={searchable}
    renderItem={option => (
      <RenderItemWrapper>
        <ConditionalProviderIcon platform name={option.value} fallback={fallback} />
        <EllipsisText>{option.title}</EllipsisText>
      </RenderItemWrapper>
    )}
  />
);

function filterIsHierarchical(filter) {
  return _.some(
    filter.options,
    option => isHierarchyFilterOption(option) && Boolean(option.hierarchy.length)
  );
}

export const RenderItemWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatusContainer = styled(RenderItemWrapper)`
  margin-left: 1rem;
  gap: 2rem;
`;

const InsightTagWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  height: 100%;
  width: 100%;
  padding: 1rem 0 1rem 2rem;
`;

const InsightInFiltersLine = styled(InsightTagWrapper)`
  padding: 0;
`;
