import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { run } from "./presets.mjs";

test("preset npm failures and deadlines remain failures", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "jsdos-process-"));
    try {
        await writeFile(path.join(directory, "package.json"), JSON.stringify({
            private: true,
            scripts: { passed: "node passed.cjs", failed: "node failed.cjs", hanging: "node hanging.cjs" },
        }));
        await writeFile(path.join(directory, "passed.cjs"), "console.log('PROCESS_PASSED');");
        await writeFile(path.join(directory, "failed.cjs"), "console.error('PROCESS_FAILED');process.exitCode=7;");
        await writeFile(path.join(directory, "hanging.cjs"), "setInterval(()=>{},1000);");
        assert.match(await run(["run", "passed"], directory), /PROCESS_PASSED/);
        await assert.rejects(run(["run", "failed"], directory), (error) => {
            assert.match(error.message, /npm run failed exited with code [1-9]/);
            assert.match(error.message, /PROCESS_FAILED/);
            return true;
        });
        await assert.rejects(run(["run", "hanging"], directory, 1000), /npm run hanging timed out after 1000ms/);
    } finally {
        await rm(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
    }
});
