import { Provider } from '@src-v2/types/enums/provider';
import { ProviderGroup } from '@src-v2/types/enums/provider-group';
import { CodeReference } from '@src-v2/types/risks/code-reference';
import { StubAny } from '@src-v2/types/stub-any';
import { uri } from '@src-v2/utils/template-literals';

export const WEBHOOK_REGEX = {
  Teams: [/^https:\/\/prod-(\d+)\.westeurope\.logic\.azure\.com:443\/workflows\/(.+)$/],
  GoogleChat: [/https:\/\/chat\.googleapis\.com\/v1\/spaces/],
};

export const WIZ_ENDPOINT_REGEX =
  /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/;
export const WIZ_CLIENTID_REGEX = /^[a-zA-Z0-9_-]+$/;
export const PORT_REGEX =
  /^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/gi;
export const WIZ_AUTHENTICATION_METHOD_OPTIONS = [
  { name: 'Cognito', value: 'Cognito' },
  { name: 'Auth0', value: 'Auth0' },
];
export const AKAMAI_API_SECURITY_AUTHENTICATION_METHOD_OPTIONS = [
  { name: 'Authorization Token', value: 'StaticToken' },
  { name: 'Service Account', value: 'ServiceAccount' },
];

export const BROKER_AGENT_KEY_REGEX = /^[A-Za-z0-9+/]{42}[AEIMQUYcgkosw480]=$/;

export const NO_WHITESPACES_REGEX = /^(?!\s)(?!\s$).*/;

export function generateCodeReferenceUrl(
  repository: StubAny,
  { relativeFilePath = null, lineNumber = null, lastLineInFile = null }: CodeReference,
  showLineNumber = true
) {
  const relativeFilePathEncoded = uri`${relativeFilePath}`.replaceAll('%2F', '/');

  switch (repository.provider ?? repository.vendor ?? repository.server?.provider) {
    case 'AzureDevops':
      return `${repository.url}?path=${relativeFilePathEncoded}&version=GB${repository.referenceName}${
        lineNumber
          ? `&line=${lineNumber}&lineEnd=${
              lastLineInFile ?? lineNumber + 1
            }&lineStartColumn=1&lineEndColumn=1&lineStyle=plain`
          : ''
      }`;

    case 'Bitbucket':
    case 'BitbucketServer':
      return `${repository.url}/browse/${relativeFilePathEncoded}${
        lineNumber ? `#${lineNumber}` : ''
      }`;

    case 'BitbucketCloud':
      return `${repository.url}/src/${repository.referenceName}/${relativeFilePathEncoded}${
        lineNumber ? `#lines-${lineNumber}` : ''
      }`;
    case 'Github':
    case 'GithubEnterprise':
      return `${repository.url}/blob/${repository.referenceName}/${relativeFilePathEncoded}${
        lineNumber && showLineNumber ? `#L${lineNumber}` : ''
      }${lastLineInFile && lastLineInFile > lineNumber && showLineNumber ? `-#L${lastLineInFile}` : ''}`;
    case 'Gitlab':
    case 'GitlabServer':
      return `${repository.url}/blob/${repository.referenceName}/${relativeFilePathEncoded}${
        lineNumber && showLineNumber ? `#L${lineNumber}` : ''
      }`;
    default:
      console.warn(
        `Tried to format URL from unsupported provider: ${repository.provider ?? repository.vendor}`
      );
  }
}

export function generateCommitReferenceUrl(
  repository: StubAny,
  commitSha?: string,
  relativePath = ''
) {
  switch (repository.provider ?? repository.vendor ?? repository.server?.provider) {
    case Provider.BitbucketServer:
    case Provider.BitbucketCloud:
    case ProviderGroup.Bitbucket:
      return `${repository.url}/commits/${commitSha}${relativePath ? `#${relativePath}` : ''}`;

    case ProviderGroup.AzureDevops:
      return `${repository.url}/commit/${commitSha}${
        relativePath
          ? `?path=${encodeURIComponent(`/${relativePath}`)}&gridItemType=2&_a=compare`
          : ''
      }`;

    case Provider.Github:
    case Provider.GithubEnterprise:
    case Provider.Gitlab:
    case Provider.GitlabServer:
      return `${repository.url}/${relativePath ? 'blob' : 'commit'}/${commitSha}/${
        relativePath ?? ''
      }`;

    default:
      console.warn(`unsupported provider ${repository.provider ?? repository.vendor ?? ''}`);
  }
}

export function generateIssueReferenceUrl(
  project: { url: string; server: { provider: Provider } },
  issueId: string
) {
  switch (project.server.provider) {
    case Provider.AzureDevops:
      return `${project.url}/${issueId}`;
    case Provider.Github:
    case Provider.Gitlab:
      return `${project.url}/issues/${issueId}`;
    case Provider.Jira:
      return `${project.url}/browse/${issueId}`;

    default:
      console.warn(`unsupported provider ${project.server.provider}`);
  }
}

export function generatePullRequestUrl(
  repository: {
    url: string;
    server: { provider: string };
  },
  pullRequestId: string
) {
  switch (repository.server.provider) {
    case ProviderGroup.AzureDevops:
      return `${repository.url}/pullrequest/${pullRequestId}`;
    case Provider.BitbucketCloud:
    case ProviderGroup.Bitbucket:
      return `${repository.url}/pull-requests/${pullRequestId}`;
    case Provider.Github:
      return `${repository.url}/pull/${pullRequestId}`;
    case Provider.Gitlab:
      return `${repository.url}/merge_requests/${pullRequestId}`;
    case Provider.Perforce:
    case Provider.GitPlain:
      return '';

    default:
      console.warn(`unsupported provider ${repository.server.provider}`);
  }
}
