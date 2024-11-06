import { observer } from 'mobx-react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Badge, BadgeColors } from '@src-v2/components/badges';
import { Button } from '@src-v2/components/button-v2';
import { Card, RibbonCard } from '@src-v2/components/cards';
import { Carousel } from '@src-v2/components/carousel';
import { ClampText } from '@src-v2/components/clamp-text';
import { SvgIcon } from '@src-v2/components/icons';
import { Page } from '@src-v2/components/layout/page';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import {
  EllipsisText,
  ExternalLink,
  Heading1,
  Paragraph,
  SubHeading3,
} from '@src-v2/components/typography';
import { CustomReportsTable } from '@src-v2/containers/pages/reporting/components/custom-reports-table';
import { useInject } from '@src-v2/hooks';
import { useBreadcrumbs } from '@src-v2/hooks/use-breadcrumbs';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

interface ReportTileProps {
  reportName: string;
  title: string;
  description: string;
  isNew?: Boolean;
}

const ReportingPage = observer(() => {
  useBreadcrumbs({
    breadcrumbs: [{ label: 'Overview', to: '/reporting' }],
  });
  const { application } = useInject();
  const { dashboard } = useParams<{ dashboard: string }>();

  return (
    <Page title="Reports overview">
      <AnalyticsLayer
        analyticsData={{
          [AnalyticsDataField.Context]: 'Reporting',
          [AnalyticsDataField.ReportingDashboard]: dashboard,
        }}>
        <OverviewCard>
          <Heading1>Welcome to your Apiiro Reports!</Heading1>
          <SubHeading3 data-variant={Variant.SECONDARY}>
            The following pre-defined reports are available for your application security posture
            management
          </SubHeading3>

          <ReportTilesContainer>
            <ReportTile
              reportName="application"
              title="Application"
              description="A comprehensive view of the application risk landscape, with insights into open and closed risks."
            />
            <ReportTile
              reportName="risk"
              title="Risk"
              description="A detailed chronicle of risk trends, with an overview that highlights how your risk landscape has evolved."
            />
            {application.isFeatureEnabled(FeatureFlag.ReportingBusiness) && (
              <ReportTile
                isNew
                reportName="business"
                title="ASPM business outcome"
                description="A concise summary of how increased Apiiro usage boosts efficiency, decreases risk and MTTR, and maintains or enhances development velocity."
              />
            )}
            {application.isFeatureEnabled(FeatureFlag.ReportingTeams) && (
              <ReportTile
                isNew
                reportName="teams"
                title="Teams report"
                description="A comprehensive view of the teams risk landscape, with insights into open and closed risks."
              />
            )}
            <ReportTile
              isNew
              reportName="CVE risk insights"
              title="CVE risk insights"
              description="Comprehensive analysis of vulnerabilities: trends, resolutions, and response efficiency."
            />
            <ReportTile
              isNew
              reportName="secrets"
              title="Secrets"
              description="A detailed overview of the secrets management security posture, highlighting key metrics and trends."
            />
            {application.isFeatureEnabled(FeatureFlag.ReportingSAST) && (
              <ReportTile
                isNew
                reportName="sast"
                title="SAST"
                description="A detailed overview of the SAST management security posture, highlighting key metrics and trends."
              />
            )}
            {application.isFeatureEnabled(FeatureFlag.ReportingSSCS) && (
              <ReportTile
                isNew
                reportName="sscs"
                title="SSCS"
                description="A detailed overview of the SSCS management security posture, highlighting key metrics and trends."
              />
            )}
            {application.isFeatureEnabled(FeatureFlag.ReportingAPI) && (
              <ReportTile
                isNew
                reportName="api"
                title="API"
                description="A detailed overview of the API management security posture, highlighting key metrics and trends."
              />
            )}
            <ReportTile
              isNew
              reportName="licensing"
              title="Licensing"
              description="Active developers metrics and trends for licensing transparency."
            />
          </ReportTilesContainer>
          <HelpRow>
            <SvgIcon name="Question" />
            <Paragraph>Need help?</Paragraph>
            <ExternalLink href="https://docs.apiiro.com/risk-graph-explorer/risk_explorer">
              View our documentation
            </ExternalLink>
          </HelpRow>
        </OverviewCard>

        {application.isFeatureEnabled(FeatureFlag.CustomReportsV2) && (
          <AsyncBoundary>
            <CustomReportsTable />
          </AsyncBoundary>
        )}
      </AnalyticsLayer>
    </Page>
  );
});

const OverviewCard = styled(Card)`
  display: flex;
  flex-direction: column;
  padding: 6rem 8rem;
  margin: 10rem 10rem 6rem 10rem;
  ${Heading1} {
    padding-bottom: 1.5rem;
  }
  ${SubHeading3} {
    margin-bottom: 4rem;
  }
`;

const ReportTilesContainer = styled(Carousel)`
  width: 100%;
  ${Carousel.Content} {
    width: unset;
    padding: 0.5rem;
  }
}`;

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

const ReportTile = styled(
  ({ reportName, title, description, isNew, ...props }: ReportTileProps) => (
    <RibbonCard {...props}>
      <TitleContainer>
        <EllipsisText>{title}</EllipsisText>
        {isNew && (
          <Badge size={Size.XSMALL} color={BadgeColors.Green}>
            New
          </Badge>
        )}
      </TitleContainer>
      <Paragraph>
        <ClampText lines={3}>{description}</ClampText>
      </Paragraph>
      <Button endIcon="Arrow" variant={Variant.SECONDARY} to={`/reporting/${reportName}`}>
        View report
      </Button>
    </RibbonCard>
  )
)`
  min-width: 90rem;
  width: 90rem;
  overflow: hidden;
  gap: 2rem;
  --card-ribbon-color: var(--color-blue-45);
  ${Button} {
    width: fit-content;
    align-self: flex-end;
  }
  ${Paragraph} {
    font-size: var(--font-size-s);
    font-weight: 300;
    line-height: 5rem;
    height: 15rem;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  ${EllipsisText} {
    font-size: var(--font-size-m);
    font-weight: 600;
    line-height: 5rem;
    max-width: 60rem;
  }
`;

export default ReportingPage;
