export type QueueMessage = {
    QueueName: string;
    Data?: string;
    Priority?: number;
    Headers?: Record<string,string>;
    CorrelationId?: string;
}

export type HandleQueueMessageRequestBody = {
    QueueMessage: QueueMessage;
    TimeoutInSeconds: number;
}

export type CustomSensitiveDataDefinitionMessage = {
    Name: string;
    ExactMatch: Set<string>;
    MultipleTokens: Set<string>;
    Wildcards: Set<string>;
}

export type ExtractCommitMessage = {
    CommitSha: string;
    RepositoryKey: string;
    CodeParsingTarget: string;
    OutputDirectoryPath: string;
    CustomSensitiveDataDefinitions: Set<CustomSensitiveDataDefinitionMessage>;
}

export type CommitExtractionDoneMessage = {
    CodeEntityToExtractedFeaturesPath: Record<string, string>;
    CodeParsingTarget: 'Node';
    CommitSha: string;
    RepositoryKey: string;
    CustomSensitiveDataDefinitions: Set<CustomSensitiveDataDefinitionMessage>;
}

export type ReFetchCommitMessage = {
    CommitSha: string;
    RepositoryKey: string;
}