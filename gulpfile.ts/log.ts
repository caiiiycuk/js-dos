// tslint:disable:no-console

import { blue, bold, red, yellow } from "colors";
import * as process from "process";

export function log(first?: any, ...args: any[]) {
    console.log.apply(null, ["[" + blue("INFO") + "]", first, ...args]);
}

export function warn(first?: any, ...args: any[]) {
    console.log.apply(null, ["[" + yellow("WARN") + "]", first, ...args]);
}

export function error(first?: any, ...args: any[]) {
    console.log.apply(null, ["[" + red("ERROR") + "]", first, ...args]);
}

export function fatal(first?: any, ...args: any[]) {
    console.log.apply(null, ["[" + bold(red("FATAL")) + "]", first, ...args]);
    process.exit(1);
}
