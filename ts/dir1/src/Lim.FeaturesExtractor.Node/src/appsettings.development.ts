export const DevAppSettings = {
    logging: {
        logLevel: 'debug'
    },
    app: {
        additionalDirectoriesToSkip: ['cloned', 'coverage'],
        port: process.env.LISTEN_PORT || 5012,
        workerFilePath: './dist/src/worker.js',
        compressOutput: false,
        messageQueuePublisherBaseUrl: process.env.QUEUE_MESSAGE_PUBLISHER_BASE_URL || 'http://localhost:8081'
    }
};
