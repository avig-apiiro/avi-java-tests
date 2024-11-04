import { EnumData } from '@src-v2/types/enum-data';
import { Provider } from '@src-v2/types/enums/provider';
import { SecretType } from '@src-v2/types/enums/secret-type';
import { BaseElement } from '@src-v2/types/inventory-elements/base-element';

export type Validity = 'NoValidator' | 'Unknown' | 'Invalid' | 'Revoked' | 'Valid';

type FileClassification =
  | 'Default'
  | 'Documentation'
  | 'Test'
  | 'Configuration'
  | 'InfrastructureAsCode'
  | 'PackageManagement'
  | 'ProjectFiles'
  | 'Scripts'
  | 'SourceCode'
  | 'NonCode';

export type SecretExposure =
  | 'Exposed'
  | 'Encrypted'
  | 'Hashed'
  | 'SaltedHashed'
  | 'Identifier'
  | 'Ignored'
  | 'Unknown';

interface Tags {
  [tag: string]: string;
}

interface BaseOccurrence {
  censoredValue: string;
  displayName: string;
  url: string | null;
}

interface CodeOccurrence extends BaseOccurrence {
  lineNumber: number;
}

interface NonCodeOccurrence extends BaseOccurrence {}

interface AdditionalJwtInfo {
  jwtIsValidFrom: Date;
  jwtIsValidUntil: Date;
  signatureAlgorithm: string;
  sensitiveDataFields: string[];
}

interface RelatedFindingSummaryInfo {
  firstDetectionTime: Date;
  url: string;
  externalSeverity: string;
  externalValidity: string;
  tags: Tags;
  provider: Provider;
}

export interface SecretElement extends BaseElement {
  validity: Validity;
  validatedOn: Date;
  exposure: EnumData<SecretExposure>;
  fileClassification: EnumData<FileClassification>;
  secretType: EnumData<SecretType>;
  externalSecretType: string;
  exclusionDefinitionId?: string;
  sources: Provider[];
  platform: string;
  environments: string[];
  occurrences: BaseOccurrence[];
  occurrencesCount: number;
  additionalJwtInfo: AdditionalJwtInfo;
  relatedFindingSummaryInfos: RelatedFindingSummaryInfo[];
  findingLocationUrl: string;
}
