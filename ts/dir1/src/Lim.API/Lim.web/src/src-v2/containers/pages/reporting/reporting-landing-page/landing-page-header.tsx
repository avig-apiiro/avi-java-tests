import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { SearchInput } from '@src-v2/components/forms/search-input';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { ExternalLink, Heading1, Paragraph, SubHeading3 } from '@src-v2/components/typography';
import { StubAny } from '@src-v2/types/stub-any';

export const ReportingPageHeader = ({
  visibleReports,
  totalReports,
  onSearchTermChange,
  isExpanded,
  onExpandToggle,
}: {
  visibleReports: StubAny;
  totalReports: number;
  onSearchTermChange: StubAny;
  isExpanded: boolean;
  onExpandToggle: StubAny;
}) => {
  return (
    <HeaderContainer>
      <TitleRow>
        <Heading1>Welcome to your Apiiro Reports!</Heading1>
        <HelpRow>
          <Paragraph>Need help?</Paragraph>
          <ExternalLink href="https://docs.apiiro.com/reports/reports-intro">
            View our documentation
          </ExternalLink>
        </HelpRow>
      </TitleRow>
      <SubHeading3>
        The following pre-defined reports are available for your application security posture
        management
      </SubHeading3>
      <SearchRow>
        <SearchInput
          variant={Variant.SECONDARY}
          placeholder="Search for pre-defined report..."
          onChange={onSearchTermChange}
        />
        <RightSection>
          <ReportCount>{`${visibleReports}/${totalReports} reports`}</ReportCount>
          {(isExpanded || visibleReports < totalReports) && (
            <Button
              variant={Variant.SECONDARY}
              onClick={onExpandToggle}
              endIcon={isExpanded ? 'Collapse' : 'Expand'}>
              {isExpanded ? 'Collapse view' : 'See all reports'}
            </Button>
          )}
        </RightSection>
      </SearchRow>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-right: 4rem;
  margin-bottom: 4rem;
  width: 100%;

  ${SubHeading3} {
    color: var(--color-blue-gray-60);
  }
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SearchRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4rem;
`;

const ReportCount = styled.span`
  font-size: var(--font-size-s);
  color: var(--color-text-secondary);
  margin-right: 3rem;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
`;

const HelpRow = styled.div`
  display: flex;
  padding-top: 4rem;
  gap: 1rem;
  align-items: center;

  ${Paragraph} {
    font-size: var(--font-size-s);
    margin-bottom: 0;
  }
`;
