import os from "os";
import prettyBytes from 'pretty-bytes';

export function getProcessMemoryConsumptionToString(recordedMemory?: NodeJS.MemoryUsage): string {
    const used = recordedMemory ?? process.memoryUsage();
    return `Process memory: usedByHeap=(${prettyBytes(used.heapUsed)}), allocatedToHeap=(${prettyBytes(used.heapTotal)}), allocatedToProcess=(${prettyBytes(used.rss)})`;
}

export function getOSMemoryConsumptionToString(): string {
    const free = os.freemem();
    const total = os.totalmem();
    return `OS memory: used=${prettyBytes(total - free)}, total=${prettyBytes(total)}`;
}

export function getMemoryConsumptionString(recordedProcessMemory?: NodeJS.MemoryUsage): string {
    return `Memory consumption: ${getProcessMemoryConsumptionToString(recordedProcessMemory)}. ${getOSMemoryConsumptionToString()}`;
}

export type MemoryConsumption = {
    heapUsed: number;
    totalText: string;
}

export function getMemoryConsumption(): MemoryConsumption {
    const processMemory = process.memoryUsage();

    return {
        heapUsed: processMemory.heapUsed,
        totalText: getMemoryConsumptionString(processMemory)
    }
}
