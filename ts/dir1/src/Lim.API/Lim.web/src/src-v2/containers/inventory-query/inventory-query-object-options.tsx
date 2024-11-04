import { ReactNode } from 'react';
import styled from 'styled-components';
import { SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { ComputationRuleTarget } from '@src-v2/types/governance/governance-rules';

export type InventoryQueryObjectDescriptor = {
  typeName: string;
  displayName: string;
  icon: ReactNode;
  description: string;

  // Master beta feature -- all functions related to this type
  betaFeature?: FeatureFlag;

  // Beta feature for query
  queryBetaFeature?: FeatureFlag;

  governanceRuleTarget?: ComputationRuleTarget;
};

export type InventoryQueryObjectCategory = {
  label: string;
  items: InventoryQueryObjectDescriptor[];
};

const EntryPointCategoryIcon = styled(SvgIcon)`
  color: var(--color-blue-65);
`;

const OssCategoryIcon = styled(SvgIcon)`
  color: var(--color-purple-45);
`;

const ConfidentialDataCategoryIcon = styled(SvgIcon)`
  color: var(--color-red-45);
`;

const DataCategoryIcon = styled(SvgIcon)`
  color: var(--color-yellow-50);
`;

const CodeStructureCategoryIcon = styled(SvgIcon)`
  color: var(--color-green-50);
`;

const DevelopmentCategoryIcon = styled(SvgIcon)`
  color: var(--color-blue-gray-50);
`;

const RiskCategoryIcon = styled(SvgIcon)`
  color: var(--risk-color-critical);
`;

const DesignCategoryIcon = styled(SvgIcon)`
  color: var(--color-orange-60);
`;

const SupplyChainCategoryIcon = styled(SvgIcon)`
  color: var(--color-pink-40);
`;

export const categorizedInventoryQueryObjectOptions: InventoryQueryObjectCategory[] = [
  {
    label: 'Code structure',
    items: [
      {
        typeName: 'ModuleProfile',
        displayName: 'Code modules',
        icon: <CodeStructureCategoryIcon name="Module" />,
        description:
          'Independent, reusable units of code that can be combined and integrated with other modules ' +
          'to build complex applications. Modules represent the discrete units of software functionality ' +
          'that are encapsulated within a larger application.',
      },
      {
        typeName: 'RepositoryProfile',
        governanceRuleTarget: { type: 'codeProfile', profileTypeName: 'RepositoryProfile' },
        displayName: 'Repositories',
        icon: <CodeStructureCategoryIcon name="Git" />,
        description:
          'Centralized storage for code, configuration, and documentation, that ' +
          'are typically managed using version control systems like Git.',
      },
      {
        typeName: 'FrameworkUsage',
        displayName: 'Technologies',
        icon: <CodeStructureCategoryIcon name="Technology" />,
        description:
          'The tools, frameworks, and platforms that are used to build, manage, and maintain a ' +
          'software application.',
      },
    ],
  },
  {
    label: 'Confidential information',
    items: [
      {
        typeName: 'Secret',
        displayName: 'Secrets',
        icon: <ConfidentialDataCategoryIcon name="Lock" />,
        description:
          'Sensitive information that is found in code or configuration files, such as passwords, ' +
          'API keys, and tokens used for authentication and authorization.',
      },
      {
        typeName: 'SensitiveData',
        displayName: 'Sensitive Data',
        icon: <ConfidentialDataCategoryIcon name="SensitiveData" />,
        description:
          'Any data that requires protection from unauthorized access, including financial, proprietary, ' +
          'or personal information (such as PII, PCI, or PHI).',
      },
    ],
  },
  {
    label: 'Data management',
    items: [
      {
        typeName: 'DataAccessObject',
        displayName: 'Data Access Objects',
        icon: <DataCategoryIcon name="DataAccessObject" />,
        description:
          'Objects responsible for abstracting and encapsulating database access and CRUD ' +
          '(create, read, update, delete) operations, that provide a consistent interface for ' +
          'data persistence.',
      },
      {
        typeName: 'DataModel',
        displayName: 'Data Models',
        icon: <DataCategoryIcon name="DataModel" />,
        description:
          'Abstract representations of real-world entities and their relationships ' +
          'that are used to structure and organize data within an application.',
      },
      {
        typeName: 'GqlType',
        displayName: 'GraphQL Objects',
        icon: <DataCategoryIcon name="GraphQl" />,
        description:
          'Types, queries, and mutations defined in a GraphQL schema that represent ' +
          'the structure and operations available within a GraphQL API.',
      },
      {
        typeName: 'ProtobufMessage',
        displayName: 'Protobuf Messages',
        icon: <DataCategoryIcon name="ProtobufMessage" />,
        description:
          'Protocol Buffers-based message formats that are used for efficient serialization ' +
          'and deserialization of structured data between client and server applications.',
      },
    ],
  },
  {
    label: 'Design',
    items: [
      {
        typeName: 'RiskyIssue',
        displayName: 'Risky Tickets',
        icon: <DesignCategoryIcon name="RiskyTicket" />,
        description:
          'Risky tickets are identified by Apiiro in your ticketing system. Recognizing these tickets effectively shifts your security considerations to the earliest stages of development. Apiiro uses deep text analysis and LLM capabilities to detect potential security gaps and risks as tickets move into the development phase. Risk types include sensitive data handling, user permissions, third-party integrations, architecture design, and GenAI usage.',
        queryBetaFeature: FeatureFlag.DesignRisksV3Explorer,
        betaFeature: FeatureFlag.DesignRisksV3,
        governanceRuleTarget: { type: 'diffable', diffableTypeName: 'RiskyIssue' },
      },
    ],
  },
  {
    label: 'Development',
    items: [
      {
        typeName: 'DeveloperProfile',
        displayName: 'Contributors',
        icon: <DevelopmentCategoryIcon name="User" />,
        description:
          'Individuals who contribute to the project by making commits or reviewing pull requests.',
      },
    ],
  },
  {
    label: 'Entry points',
    items: [
      {
        typeName: 'ApiElement',
        displayName: 'APIs',
        icon: <EntryPointCategoryIcon name="Api" />,
        description:
          'Standardized software interfaces that let different software applications communicate with ' +
          'each other and exchange data by defining response methods, protocols, and data formats.',
      },
      {
        typeName: 'ProtobufService',
        displayName: 'Protobuf Services',
        icon: <EntryPointCategoryIcon name="ProtobufService" />,
        description:
          'gRPC-based services using Protocol Buffers (Protobuf) for efficient, ' +
          'structured data serialization between client and server applications. gRPC is an open-source ' +
          'RPC (Remote Procedure Call) framework that is used to build scalable and fast APIs.',
      },
      {
        typeName: 'ServerlessFunction',
        displayName: 'Serverless',
        icon: <EntryPointCategoryIcon name="Serverless" />,
        description:
          'A cloud computing execution model in which the cloud provider manages the infrastructure ' +
          "and automatically allocates resources based on an application's needs.",
      },
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      {
        typeName: 'Dockerfile',
        displayName: 'Dockerfile',
        icon: <VendorIcon name="Docker" />,
        description:
          'A script that contains instructions for building a Docker container image. ' +
          'A Dockerfile packages an application and its dependencies into an isolated environment.',
      },
      {
        typeName: 'TerraformResourceSummary',
        displayName: 'Terraform',
        icon: <VendorIcon name="Terraform" />,
        description:
          'An infrastructure-as-code (IaC) tool that is used to manage and provision ' +
          'cloud resources and infrastructure via configuration files.',
      },
    ],
  },
  {
    label: 'Kubernetes',
    items: [
      {
        typeName: 'KubernetesDeployment',
        displayName: 'Deployments',
        icon: <SvgIcon name="KubernetesDeployment" />,
        description:
          'Kubernetes resources that describe which pods need to be created in the cluster. A deployment ' +
          'also includes the scale and availability constraints for the pods.',
      },
      {
        typeName: 'KubernetesService',
        displayName: 'Services',
        icon: <SvgIcon name="KubernetesService" />,
        description:
          'A service enables network access to an application that is running as a set of pods in a Kubernetes cluster.',
      },
    ],
  },
  {
    label: 'Open source',
    items: [
      {
        typeName: 'DependencyDeclaration',
        displayName: 'Dependencies',
        icon: <OssCategoryIcon name="Dependency" />,
        description:
          'Open source libraries, packages, or modules that a software relies on to function properly.',
      },
      {
        typeName: 'LicenseWithDependencies',
        displayName: 'Licenses',
        icon: <OssCategoryIcon name="License" />,
        description:
          'Legal agreements that grant permission to use, modify, and distribute software or its components.',
      },
    ],
  },

  {
    label: 'Risks and Findings',
    items: [
      {
        typeName: 'RiskTriggerSummary',
        displayName: 'Risks',
        icon: <RiskCategoryIcon name="RiskArea" />,
        description:
          'Potential threats or vulnerabilities that can negatively impact the security, ' +
          'performance, or availability of an application. Risks are generated from the Apiiro governance policies.',
      },
      {
        typeName: 'ProcessedFinding',
        displayName: 'Findings',
        icon: <RiskCategoryIcon name="FindingsObjectType" />,
        queryBetaFeature: FeatureFlag.ProcessedFindingsInExplorer,
        description:
          'Identify the issues you may encounter in your codebase or infrastructure that can lead to security ' +
          'vulnerabilities and exploitable weaknesses, Act as building blocks for the risks created by Apiiro’s ' +
          'governance policies. Currently supported findings: Cloud security, bug bounty, penetration testing.',
        governanceRuleTarget: { type: 'finding', findingTypeName: 'ProcessedFinding' },
      },
      {
        typeName: 'CodeFinding',
        displayName: 'SAST Findings',
        icon: <RiskCategoryIcon name="FindingsObjectType" />,
        betaFeature: FeatureFlag.CodeFindingsInExplorer,
        description:
          'Identify the SAST issues in your codebase that can lead to security vulnerabilities and exploitable' +
          ' weaknesses, these issues act as building blocks for the risks created by Apiiro’s governance policies.',
        governanceRuleTarget: { type: 'diffable', diffableTypeName: 'CodeFinding' },
      },
    ],
  },
  {
    label: 'Supply chain',
    items: [
      {
        typeName: 'CicdPipelineDeclaration',
        displayName: 'Pipeline Configurations',
        icon: <SupplyChainCategoryIcon name="Pipeline" />,
        description:
          'The pipeline configuration defines a CI/CD pipeline and its settings, such as the pipeline steps and its ' +
          'dependencies for building code, unit tests, code analysis, security, and binaries creation.',
        betaFeature: FeatureFlag.PipelineTables,
      },
      {
        typeName: 'ArtifactMultiSourcedEntity',
        displayName: 'Artifacts',
        icon: <SupplyChainCategoryIcon name="Artifact" />,
        description:
          'Artifacts are versioned instances of a software component such as container images or binary files that are managed and stored for reuse, distribution, and deployment within a software development or deployment environment.',
        queryBetaFeature: FeatureFlag.ArtifactsInExplorer,
      },
    ],
  },
];

export const inventoryQueryObjectOptions: InventoryQueryObjectDescriptor[] =
  categorizedInventoryQueryObjectOptions.flatMap(_ => _.items);

export function createGovernanceRuleTargetFromTargetObjectType(
  targetObjectType: InventoryQueryObjectDescriptor,
  governanceOptions: any
): ComputationRuleTarget | null {
  if (
    governanceOptions.when?.EntitySatisfiesExpression?.subTypes?.find(
      subType => subType.key === targetObjectType.typeName
    )
  ) {
    return {
      type: 'diffable',
      diffableTypeName: targetObjectType.typeName,
    };
  }

  return targetObjectType.governanceRuleTarget ?? null;
}

export function getTargetObjectTypeFromGovernanceRuleTarget(
  ruleTarget: ComputationRuleTarget
): InventoryQueryObjectDescriptor {
  switch (ruleTarget.type) {
    case 'diffable':
      return inventoryQueryObjectOptions.find(
        option => option.typeName === ruleTarget.diffableTypeName
      );

    case 'codeProfile':
      return inventoryQueryObjectOptions.find(
        option => option.typeName === ruleTarget.profileTypeName
      );

    case 'finding':
      return inventoryQueryObjectOptions.find(
        option => option.typeName === ruleTarget.findingTypeName
      );

    default:
      return null;
  }
}
