import { execFile } from "child_process";
import { fatal, log, warn } from "./log";

export function execute(file: string, ...args: string[]): Promise<string> {
    return executeImpl(file, false, ...args);
}

export function executeQuiet(file: string, ...args: string[]): Promise<string> {
    return executeImpl(file, true, ...args);
}

function executeImpl(file: string, nolog: boolean, ...args: string[]): Promise<string> {
    return new Promise<string>((resolve) => {
        if (!nolog) {
            log("execute", file, ...args);
        }
        const started = Date.now();
        execFile(file, args, { maxBuffer: 16 * 1024 * 1024 }, (error, stdout, stderr) => {
            if (error !== null) {
                fatal(error, stdout, stderr);
            } else {
                const time = (Date.now() - started) / 1000;
                if (time > 60) {
                    warn("execution time " + (time / 60.0).toFixed(2) + " min");
                }
                resolve(stdout);
            }
        });
    });
}
