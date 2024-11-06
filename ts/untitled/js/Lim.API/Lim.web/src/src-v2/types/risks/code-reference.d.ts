import { CodeParsingTarget } from '@src-v2/types/code-parsing-target';
import { Language } from '@src-v2/types/enums/language';

export interface CodeReference {
  relativeFilePath?: string;
  lineNumber?: number;
  lastLineInFile?: number;
}

export interface ExtendedCodeReference extends CodeReference {
  detectedImport: string;
}

export interface NamedCodeReference extends CodeReference {
  name: string;
}

export interface ParsingTargetCodeReference extends CodeReference {
  codeParsingTarget: CodeParsingTarget;
  language?: Language;
  detectedImport: string;
}

export interface ApiCodeReference extends CodeReference {
  apiName: string;
  httpMethod: string;
  httpRoute: string;
  methodName: string;
  methodSignature: string;
  className: string;
}
