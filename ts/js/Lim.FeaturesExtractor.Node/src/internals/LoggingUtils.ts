import {LimLogger} from "./Logger";
import {getMemoryConsumption, MemoryConsumption} from "./MemoryUtils";
import {hrtimeToString} from "./TimeUtils";

export async function executeWithLogAsync<T>(logger: LimLogger, operation: string, closure: () => T | Promise<T>): Promise<T> {
    let success = false;
    const start = process.hrtime();
    logger.info(`[${operation}] Starting`);

    const startMemoryConsumption = getMemoryConsumption();
    let endMemoryConsumption: MemoryConsumption | undefined = undefined;
    logMemoryUsage("debug", startMemoryConsumption);

    try {
        const result = await closure();
        endMemoryConsumption = getMemoryConsumption();
        logMemoryUsage("info", endMemoryConsumption);
        success = true;
        return result;
    } finally {
        const elapsedTime = process.hrtime(start);
        logger.info(`[${operation}] ${success ? "Completed" : "Failed"} in ${hrtimeToString(elapsedTime)}`);
    }

    function logMemoryUsage(memoryLogLevel: string, memoryConsumption: MemoryConsumption): void {
        logger[memoryLogLevel](`[${operation}] ${memoryConsumption.totalText}`);
    }
}
