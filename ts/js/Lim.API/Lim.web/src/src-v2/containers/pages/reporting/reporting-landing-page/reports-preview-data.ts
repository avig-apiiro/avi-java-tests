import { ReportPreviewData } from '@src-v2/containers/pages/reporting/reporting-landing-page/types';

export const reportsPreviewData: ReportPreviewData[] = [
  {
    reportName: 'application',
    title: 'Application',
    description:
      'A comprehensive view of the application risk landscape, with insights into open and closed risks.',
    isNew: false,
    thumbnailSrc: '../assets/thumbnails/application.png',
    screenshotSrc: '/images/screenshots/application.png',
  },
  {
    reportName: 'risk',
    title: 'Risk',
    description:
      'A detailed chronicle of risk trends, with an overview that highlights how your risk landscape has evolved.',
    isNew: false,
    thumbnailSrc: '/images/thumbnails/risk.png',
    screenshotSrc: '/images/screenshots/risk.png',
  },
  {
    reportName: 'business',
    title: 'ASPM business outcome',
    description:
      'A concise summary of how increased Apiiro usage boosts efficiency, decreases risk and MTTR, and maintains or enhances development velocity.',
    isNew: true,
    thumbnailSrc: '/images/thumbnails/business.png',
    screenshotSrc: '/images/screenshots/business.png',
    featureFlag: 'ReportingBusiness',
  },
  {
    reportName: 'teams',
    title: 'Teams report',
    description:
      'A comprehensive view of the teams risk landscape, with insights into open and closed risks.',
    isNew: true,
    thumbnailSrc: '/images/thumbnails/teams.png',
    screenshotSrc: '/images/screenshots/teams.png',
    featureFlag: 'ReportingTeams',
  },
  {
    reportName: 'CVE risk insights',
    title: 'CVE risk insights',
    description:
      'Comprehensive analysis of vulnerabilities: trends, resolutions, and response efficiency.',
    isNew: true,
    thumbnailSrc: '/images/thumbnails/cve-risk-insights.png',
    screenshotSrc: '/images/screenshots/cve-risk-insights.png',
  },
  {
    reportName: 'secrets',
    title: 'Secrets',
    description:
      'A detailed overview of the secrets management security posture, highlighting key metrics and trends.',
    isNew: true,
    thumbnailSrc: '/images/thumbnails/secrets.png',
    screenshotSrc: '/images/screenshots/secrets.png',
  },
  {
    reportName: 'licensing',
    title: 'Licensing',
    description: 'Active developers metrics and trends for licensing transparency.',
    isNew: true,
    thumbnailSrc: '/images/thumbnails/licensing.png',
    screenshotSrc: '/images/screenshots/licensing.png',
    featureFlag: 'ReportingLicense',
  },
  {
    reportName: 'sast',
    title: 'SAST',
    description:
      'A detailed overview of the SAST management security posture, highlighting key metrics and trends.',
    isNew: true,
    thumbnailSrc: '/images/thumbnails/sast.png',
    screenshotSrc: '/images/screenshots/sast.png',
    featureFlag: 'ReportingSAST',
  },
  {
    reportName: 'sscs',
    title: 'SSCS',
    description:
      'A detailed overview of the SSCS management security posture, highlighting key metrics and trends.',
    isNew: true,
    thumbnailSrc: '/images/thumbnails/sscs.png',
    screenshotSrc: '/images/screenshots/sscs.png',
    featureFlag: 'ReportingSSCS',
  },
  {
    reportName: 'api',
    title: 'API',
    description:
      'A detailed overview of the API management security posture, highlighting key metrics and trends.',
    isNew: true,
    thumbnailSrc: '/images/thumbnails/api.png',
    screenshotSrc: '/images/screenshots/api.png',
    featureFlag: 'ReportingAPI',
  },
];
