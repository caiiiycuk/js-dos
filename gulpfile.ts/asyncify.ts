import { log, error, warn } from "./log";
import * as fs from "fs";

const asyncifyFile = "native/dos/asyncify.txt";
const stackFile = "/tmp/stack.txt";

export async function asyncifyAdd() {
    if (!fs.existsSync(stackFile)) {
        error("Stack file " + stackFile + " does not exists, exitinig...");
        return;
    }

    const content = fs.readFileSync(asyncifyFile, "UTF-8");
    const functions = JSON.parse(content);
    const functionsSet: {[name: string]: number} = {};
    for (const next of functions) {
        functionsSet[next] = 1;
    }

    const entries = fs.readFileSync(stackFile, "UTF-8").split("\n");
    const newEntries: string[] = [];
    for (const next of entries) {
        const fnSig = extractFnSignature(next);
        if (fnSig.length === 0 || functionsSet[fnSig] !== undefined) {
            continue;
        }

        newEntries.push(fnSig);
        functionsSet[fnSig] = 1;
    }

    if (newEntries.length === 0) {
        log("No new entires, exiting...");
    }

    log("== asyncify list")
    const sorted = Object.keys(functionsSet).sort();
    let outcome = "[";
    for (const next of sorted) {
        outcome += "\"" + next + "\",";
        log("\t'" + next + "'");
    }
    outcome = outcome.substr(0, outcome.length - 1) + "]";
    fs.writeFileSync(asyncifyFile, outcome, "UTF-8");

    log("== New entries:");
    newEntries.sort();
    for (const next of newEntries) {
        log("\t'" + next + "'");
    }

    log("Well done...");
}

function extractFnSignature(next: string): string {
    if (next.length === 0) {
        return "";
    }

    const index = next.indexOf("@");
    if (index === -1) {
        warn("Unparsable entry '" + next + "'");
        return "";
    }

    const fnSig = next.substr(0, index).trim();
    if (fnSig.indexOf("\"") !== -1) {
        warn("Entry contains \" '" + next + "', skipping...");
        return "";
    }

    return fnSig;
}
