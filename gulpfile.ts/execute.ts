import { execFile } from "child_process";

export function execute(file: string, ...args: string[]): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		console.log("execute", file, ...args);
		execFile(file, args, { maxBuffer: 16 * 1024 * 1024 }, (error, stdout, stderr) => {
			if (error !== null) {
				console.error(error, stdout, stderr);
				reject(error);
			} else {
				resolve();
			}
		});
	});
}
