import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { StickyHeader } from '@src-v2/components/layout';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading2, SubHeading4 } from '@src-v2/components/typography';

interface ReportingDashboardHeaderProps {
  pageLoading: boolean;
  reportReady: boolean;
  isDownloadingPdf: boolean;
  customReport?: boolean;
  handleDownloadPdf: (reportName: string, description: string) => void;
  handleShareLink: () => void;
  handleEditReport?: () => void;
  headerContent?: { title: string; description?: string; reportName?: string };
}

export const ReportingDashboardHeader = styled(
  ({
    pageLoading,
    reportReady,
    isDownloadingPdf,
    handleDownloadPdf,
    handleShareLink,
    handleEditReport,
    headerContent,
    customReport,
    ...props
  }: ReportingDashboardHeaderProps) => {
    const { dashboard } = useParams<{ dashboard: string }>();
    const content = headerContent ?? getDashboardHeaderContent(dashboard);

    return (
      <div {...props}>
        <StickyHeader
          title={
            <HeaderContainer>
              <Heading2>{content.title}</Heading2>
              <SubHeading4>{content.description}</SubHeading4>
            </HeaderContainer>
          }>
          {customReport && (
            <Button
              variant={Variant.TERTIARY}
              startIcon="Edit"
              disabled={!reportReady || pageLoading}
              onClick={handleEditReport}>
              Edit
            </Button>
          )}
          <Button
            variant={Variant.TERTIARY}
            startIcon="Share"
            loading={isDownloadingPdf}
            disabled={!reportReady || pageLoading}
            onClick={handleShareLink}>
            Share link
          </Button>
          <Tooltip content="Enable 'Background Graphics' in the print settings for best results before saving the PDF.">
            <Button
              startIcon="Export"
              loading={isDownloadingPdf}
              disabled={!reportReady || pageLoading}
              onClick={() => handleDownloadPdf(content.reportName, content.description)}>
              Export PDF
            </Button>
          </Tooltip>
        </StickyHeader>
      </div>
    );
  }
)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;

  ${SubHeading4} {
    max-width: 250rem;
    white-space: pre-wrap;
  }

  ${Button} {
    margin-top: 5rem;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const getDashboardHeaderContent = (dashboardName: string) => {
  switch (dashboardName) {
    case 'application':
      return {
        title: 'Application overview',
        description:
          'This report provides a comprehensive view of the application risk landscape, with insights into open and closed risks.',
        reportName: 'Application Risk View Report',
      };
    case 'risk':
      return {
        title: 'Risk report',
        description:
          'This report provides a detailed chronicle of risk trends, with an overview that highlights how your risk landscape has evolved.',
        reportName: 'Risk Trends Report',
      };
    case 'business':
      return {
        title: 'ASPM business outcome',
        description:
          'A concise summary of how increased Apiiro usage boosts efficiency, decreases risk and MTTR, and maintains or enhances development velocity',
        reportName: 'ASPM business outcome',
      };
    case 'teams':
      return {
        title: 'Teams',
        description:
          'A comprehensive view of the teams risk landscape, with insights into open and closed risks.',
        reportName: 'Teams Report',
      };
    case 'CVE risk insights':
      return {
        title: 'CVE risk insights',
        description:
          'Comprehensive analysis of vulnerabilities: trends, resolutions, and response efficiency.',
        reportName: 'CVE Risk Insights',
      };
    case 'licensing':
      return {
        title: 'Licensing',
        description: 'Active developers metrics and trends for licensing transparency.',
        reportName: 'Licensing report',
      };
    case 'secrets':
      return {
        title: 'Secrets',
        description:
          'A detailed overview of the secrets management security posture, highlighting key metrics and trends.',
        reportName: 'Secrets risks report',
      };
    case 'sast':
      return {
        title: 'SAST',
        description:
          'A detailed overview of the SAST management security posture, highlighting key metrics and trends.',
        reportName: 'SAST risks report',
      };
    case 'sscs':
      return {
        title: 'SSCS',
        description:
          'A detailed overview of the SSCS management security posture, highlighting key metrics and trends.',
        reportName: 'SSCS risks report',
      };
    case 'api':
      return {
        title: 'API',
        description:
          'A detailed overview of the API management security posture, highlighting key metrics and trends.',
        reportName: 'API risks report',
      };

    default:
      console.warn('Unknown dashboard');
      return { title: '', description: '' };
  }
};
