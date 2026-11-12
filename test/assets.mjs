import { rename } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";

const resource = "mcp/assets/emulators/wdosbox.wasm";
await rename(resource, resource + ".test-held");
try {
    const result = spawnSync("cargo", ["check", "--manifest-path", "mcp/Cargo.toml", "--locked"], { encoding: "utf8" });
    assert.notEqual(result.status, 0, "Missing required WASM was accepted");
    assert.match(result.stderr, /Missing manifest asset|Missing required resource/);
} finally { await rename(resource + ".test-held", resource); }
console.log(JSON.stringify({ suite: "missing-assets", status: "passed" }));
