export const AppSettings = {
    logging: {
        logLevel: 'info',
        logDirectory: 'logs',
        logFilename: 'lim-features-extractor-node.log'
    },
    directories: {
        sharedDirectoryRootPath: process.env.SHARED_DIRECTORY_ROOT_PATH || "/var/shared",
        gitDirectoryName: "git"
    },
    app: {
        additionalDirectoriesToSkip: [],
        port: process.env.LISTEN_PORT || 8104,
        workers: undefined,
        typesCacheSize: 1e4,
        workerFilePath: './dist/worker.js',
        compressOutput: true,
        timeoutMinutes: Number(process.env.PARSE_TIMEOUT_MINUTES) || 360,
        messageQueuePublisherBaseUrl: process.env.QUEUE_MESSAGE_PUBLISHER_BASE_URL || 'http://lim-rabbitmq-publisher:8081'
    }
};
