import { execFile } from "child_process";
import { exit } from "process";

export function execute(file: string, ...args: string[]): void {
	console.log("execute", file, ...args);
	execFile(file, args, { maxBuffer: 16 * 1024 * 1024 }, (error, stdout, stderr) => {
		if (error !== null) {
			console.error(error, stdout, stderr);
			exit(1);
		}
	});
}
