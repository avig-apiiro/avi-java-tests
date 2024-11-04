import fs from 'fs';
import {baseClonedPath, baseResultsPath, tmpWorkingDirectory} from "./consts";

export function ensureWorkingDirectories() {
    for (const basePath of [baseClonedPath, baseResultsPath, tmpWorkingDirectory]) {
        if (!(fs.existsSync(basePath))) {
            fs.mkdirSync((basePath));
        }
    }
}
