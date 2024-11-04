export interface QuestionnaireRequest {
  templateId: string;
  title: string;
  triggeringIssueParams: {
    externalId: string;
    externalUrl: string;
    provider: string;
  };
}
