import {exec, ExecException} from "child_process";
import fs from 'fs';
import util from "util";

export const rmdirAsync = util.promisify(fs.rmdir);
export const existsAsync = util.promisify(fs.exists);
export const writeFileAsync = util.promisify(fs.writeFile);
export const statFileAsync = util.promisify(fs.stat);

export const execAsync = (command: string): Promise<{ error?: ExecException, stdout: string, stderr: string }> =>
    new Promise(async (resolve, reject) => {
        exec(command, (error: ExecException, stdout, stderr) => {
            stdout = stdout.trim()
            stderr = stderr.trim()
            resolve({error, stdout, stderr});
        });
    });
