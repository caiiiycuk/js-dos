# Verification

Status on 2026-11-10: published emulators 8.5.3 is integrated and Linux verification passes without an SDK override or local patch. OpenCode 2.2.5 connects to the extracted Linux executable and discovers eight tools. The full release remains blocked on native matrix acceptance.

## Environment

Linux 7.0.0-42-generic x86_64, Chrome 157.0.8103.50, Node.js 22.17.1, Yarn 1.22.22 and Rust/Cargo 1.95.0. OpenCode 2.2.5 was checked again with the release executable in an isolated environment. These are observed versions, not tested minimums.

## Checks that passed

- `yarn install --frozen-lockfile --ignore-scripts` installed npm emulators 8.5.3. TypeScript checks, source/test ESLint, the existing player build and the dedicated MCP asset build passed without changing the user's root `index.html`.
- A clean directory with no existing `node_modules`, root `dist/` or MCP assets reproduced the complete asset manifest from the lockfile. Its SHA-256 is `af07f54f2bacfedc39d6f76d4025bbd98f67a0ade1e018ef4b47cfcddf343c31`. `node test/assets.mjs` confirmed that a missing required WASM file fails the Rust build.
- `cargo test --locked` passed all nine tests. `cargo clippy --locked --all-targets -- -D warnings`, `cargo fmt --check` and the Linux release build passed. Rust metadata checks passed for Windows x86_64 and macOS x86_64/arm64; they are not native linking or runtime tests.
- `node test/stdio.mjs mcp/target/release/jsdos-mcp` passed with an empty child PATH: eight tools, generation of all five presets without Node.js, two isolated processes and port cleanup on EOF.
- `node mcp/package-release.mjs linux-x86_64` packaged the Linux draft with source metadata, the asset manifest and 166 Rust dependency notice entries. Its `.sha256` matched the archive. After extraction, the executable hash and packaged SDK version matched, and `test/stdio.mjs` passed against that extracted executable with an empty child PATH. The archive records `workingTreeDirty:true`; it is not a published release.
- OpenCode 2.2.5 connected to that extracted executable using the documented V2 `mcp.servers` entry. Its log records `mcp connected` with `tools=8`, the CLI reports `connected`, and explicit connection returns HTTP 204. Both a persistent foreground server and the private background service passed after initialization. The check used isolated HOME/XDG directories and did not change the user's configuration or main service.
- `JSDOS_MCP_BINARY="$PWD/mcp/target/release/jsdos-mcp" npm run test:presets` passed both DOSBox and DOSBox-X editor suites, all MCP checks and all five standalone presets with external runtime HTTP(S) denied. Checks include UI/MCP revisions, import/config/files, legacy changes save, full export/reimport, destination conflicts, diagnostics, input, screenshots, recovery and secret redaction.
- HTML startup and all framework dev/build/production checks passed after MCP shutdown. React, Vue and Angular passed remount checks with actual AudioContexts closed after unmount, exactly one active context after remount and all contexts closed after the final unmount. Vite and Angular opt-in diagnostic checks also passed.
- The upgrade exposed DOSBox `[LOG_*]` messages on the SDK error channel. Studio now retains those messages without treating them as a failed browser backend. Regression checks confirm that stdout waits still time out and that worker, panic and other backend errors still return errors.

The browser report is `mcp/release/verification-linux-x64.json`, recorded at `2026-11-10T13:59:15.410Z`. It records `status:passed`, `editor:true`, `mcp:true`, `presets:true` and `emulatorsOverrideSha256:null`, tied to the executable hash below. This ignored local report is not a remote CI result.

## OpenCode readiness investigation

The earlier OpenCode blocker was a cold-start race, not an invalid MCP configuration or a Rust handshake failure. In one private OpenCode process, the first `/api/mcp` and `/api/plugin` responses were empty. Explicit connection returned HTTP 404 `McpServerNotFoundError`. About 1.7 seconds later, without a configuration change, `opencode.config.mcp` was active, the server was connected, and the same connect endpoint returned HTTP 204. This delay is an observation, not a guaranteed startup bound.

The installed binary's bundled JavaScript agrees with the observation: `PluginSupervisor.activate` runs asynchronously, `ConfigMCPPlugin.register` adds the configured servers, and the MCP list/connect handlers query the runtime registry without waiting for that plugin to finish. A fresh `--standalone` check can therefore read the registry too early. Repeated immediate CLI calls against a new background service also reproduced the empty list; after initialization the ordinary CLI reported `connected`.

`mcp/release/opencode-linux-x64.json` records the passing connection, eight tools, the cold/warm results and the extracted executable hash. It is ignored local evidence, not a native matrix result. No OpenCode installation or js-dos runtime code was patched during this investigation. Check `/mcps` after app startup or reuse an initialized service instead of repeatedly creating standalone servers.

## SDK provenance

`npm view emulators@8.5.3 version gitHead dist --json` identifies source commit `e6f4e5449a5b17ae3ea0fdccfd453c8d299e9ea5`. `mcp/sources.json` and `yarn.lock` record the registry integrity. The immutable source archive returned HTTP 200. Pinned DOSBox/DOSBox-X revisions and the libzip source tree were checked against that commit.

The installed `dist/emulators.js` SHA-256 is `52598b412977a892fa81c5613c653ed233e06732972c02897d8eac115b941075`. It is the published package, not the earlier locally packed candidate. Asset preparation copies its normal JS/WASM files into the embedded runtime and generated projects.

`emulators-audio-lifecycle.patch` is retained only as the historical handoff artifact. No build, install or runtime step applies it. This upgrade did not modify the adjacent emulators checkout or manually patch `node_modules`.

The override is test-only. Its report has status `development-sdk`, never `passed`, and records the selected JavaScript hash. It does not change installed dependencies, embedded release assets or generated projects. Browser reports are invalidated at the beginning of a run and failures replace older successes, so a failed run cannot leave a stale release pass.

## Remaining blockers

1. Native Linux/Windows/macOS release-matrix results and Windows/macOS browser acceptance are pending in [PR #458](https://github.com/caiiiycuk/js-dos/pull/458), created by the user after the integration could not create it. With the user's approval, implementation snapshot `6bcf9c0e8120bba68c91fe791ce86b384e60ca1f` and the workflow were pushed to `ci/jsdos-mcp-native-acceptance`. The current checkout remains on `mcp`; unrelated root `README.md`, `index.html`, `.opencode` and local OpenSpec planning files were excluded from that snapshot. No checks appeared after PR creation. `actionlint 1.7.12` accepted the workflow, and a push trigger limited to the acceptance branch was added to start the matrix directly. No authorization settings, release tags or publications were changed. Tasks 8.1 and 8.3 remain open until native results pass.
2. All presets now pass locally with the fixed SDK, but final per-platform binary sizes, checksums and licenses must come from the passing native matrix. Task 8.4 remains open pending those outputs. No release was published by this upgrade.

## Draft size and limitations

The rebuilt local Linux executable measured 15,622,640 bytes with SHA-256 `80c9bfd8c9e57b36288a5b1d59d02f25b9653c083ade5ae5f3a4cb970dbac690`. It embeds published emulators 8.5.3 and passed the checks above. The local Linux archive is a draft from a dirty working tree, not an accepted release. Windows/macOS sizes are not measured.

Browser autoplay and background throttling remain external constraints. A suspended or backend-managed audio context is not a game error. External sockdrive/qcow2 resources are not included in exported archives. Readiness and observed stdout do not prove arbitrary game correctness. Fatal worker crashes were not tested. Existing peer-dependency, caniuse-lite and CSS `start` compatibility warnings remain.
