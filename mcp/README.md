# js-dos MCP

The server runs over stdio and serves a local Studio in your installed browser. Its executable contains the player, DOSBox and DOSBox-X workers, libzip, styles, templates and notices. Running the executable does not need Node.js, npm, Rust, Tauri or Playwright.

This source checkout pins published emulators 8.5.3 with native audio cleanup. Native acceptance passed on Linux x86_64, Windows x86_64 and macOS Intel/arm64. The OpenCode connection was also verified on Linux. See `VERIFICATION.md` and `acceptance/43047052131.json` for the tested environments, checksums and limitations.

## Install a release

Download the matching archive and `.sha256` file from [Releases](https://github.com/caiiiycuk/js-dos/releases). MCP tags use `mcp-v*`, separately from the existing js-dos npm releases. A platform is not accepted until its native CI and browser checks have passed. See `VERIFICATION.md` for the checks actually run in this checkout.

Verified pre-release archives for all four targets are available in [CI run 43047052131](https://github.com/caiiiycuk/js-dos/actions/runs/43047052131). Use Releases above for published versions.

Archives are named `jsdos-mcp-linux-x86_64.tar.gz`, `jsdos-mcp-windows-x86_64.tar.gz`, `jsdos-mcp-macos-x86_64.tar.gz` and `jsdos-mcp-macos-arm64.tar.gz`. Verify the hash before extracting:

```sh
sha256sum -c jsdos-mcp-linux-x86_64.sha256
tar -xzf jsdos-mcp-linux-x86_64.tar.gz
chmod +x jsdos-mcp/jsdos-mcp
```

macOS can use `shasum -a 256` and Windows can use `Get-FileHash -Algorithm SHA256` to compare with the published checksum. Windows also includes `tar` on supported systems. macOS may ask you to approve an unsigned downloaded executable. No signing or notarization is claimed.

The release matrix targets Linux x86_64 with glibc 2.35 or newer, Windows 10/11 x86_64, and macOS 15 or newer on Intel and Apple silicon. A current browser with WebAssembly, workers, canvas and WebSocket support is required. Linux needs `xdg-open` and a graphical desktop for automatic opening; otherwise use the returned URL on the same machine. A terminal-only or remote browser cannot reach another machine's loopback server without a separately arranged connection. Windows may need the Microsoft Visual C++ runtime used by Rust's MSVC target.

## Connect OpenCode V2

Use an absolute executable path. The CLI preserves unrelated settings:

```sh
opencode mcp add jsdos --global -- /absolute/path/jsdos-mcp/jsdos-mcp
opencode mcp list
```

On Windows, use the absolute path to `jsdos-mcp.exe`. To edit configuration instead, merge the following entry into `opencode.jsonc`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "jsdos": {
        "type": "local",
        "command": ["/absolute/path/jsdos-mcp/jsdos-mcp"],
        "timeout": { "execution": 150000 }
      }
    }
  }
}
```

The configuration follows the [OpenCode V2 MCP guide](https://opencode.ai/v2/docs/mcp-servers), checked on 2026-11-10. V2 uses `mcp.servers`, not a server directly under `mcp`. OpenCode reloads configuration after a save. Use `/mcps` to inspect the connection. MCP connection and browser readiness are separate states.

The extracted Linux executable connected through OpenCode 2.2.5 using this V2 configuration. OpenCode discovered all eight tools, `mcp list` reported `connected`, and explicit connection returned HTTP 204. The check used an isolated HOME and XDG directories without changing the user's configuration.

OpenCode 2.2.5 has a cold-start readiness race. Before its `opencode.config.mcp` plugin activates, `mcp list` can report `No MCP servers configured` and explicit connection can return HTTP 404 even with valid configuration. Keep the same service running and check again after startup, or inspect `/mcps` in the initialized app. Repeating `--standalone` creates another cold server and is not a reliable readiness check. This does not require changing the MCP entry or patching js-dos.

## Create, edit, run and export

First, call `studio` with `{"open_browser":true}`. If automatic opening fails, its result contains `openError` and the URL for manual opening. The URL includes a session secret in its fragment. Treat the URL as private. Studio removes the fragment from the visible address and uses it only for its own control connection.

Second, call `editor` with `{"operation":"state"}` after Studio reports `connected`. The state includes `revision`, draft and running configuration, CI readiness, pause, visibility, audio and volume. Every MCP edit requires `expected_revision`. Read state again after a conflict, disconnect or unknown outcome.

Third, create or import a bundle:

```json
{"operation":"create","dosbox_conf":"[autoexec]\n@echo off\necho MCP_READY\n","expected_revision":0}
```

`open` takes an explicitly selected `source` ZIP or directory. A directory must contain `.jsdos/dosbox.conf`; `.jsdos/jsdos.json`, when present, must be valid JSON with a version. Opening over edits requires `discard_changes:true`. UI edits and MCP edits use the same queue and revision checks.

Use `config` with `dosbox_conf`, `jsdos_version` and `expected_revision`. Use `start` before `tree`, `read` or `files`; file access never starts an emulator implicitly. `files` takes entries with `path` and either `contents_base64` or `delete:true`. A partial batch failure reports `completed` and the resulting revision. Revision tracks editor operations, not every write a DOS program makes.

Finally, export explicitly:

```json
{"operation":"export","destination":"/chosen/existing/directory/game.jsdos","expected_revision":3,"replace":false}
```

Export captures a complete ZIP, including current files and the draft configuration. Before launch it uses the retained original archive. After launch it uses `persist(false)` and overlays the draft. Export restores the previous pause policy even on failure. `restart` uses the same complete snapshot. It is not the legacy `save()` operation, which still saves only changes with `persist(true)`.

The destination's parent must exist. A temporary file on the same filesystem is flushed before publication. An existing file requires `replace:true`; links and directories are rejected. An export error does not replace the previous destination with a partial file. Export reports its path, captured revision and external disk warnings. A dirty editor remains conservative about later replacement even after an export.

Closing a tab loses its unsaved memory. The server retains only the original import and last confirmed complete snapshot. Reopen the URL from `studio`, read the new state, then explicitly use `recover` with its revision and discard permission. Reloading a page also needs the original URL because its fragment was removed. Neither reconnect nor recovery repeats an interrupted command automatically. An interrupted mutation reports an unknown outcome; inspect state before retrying.

## Diagnostics and input

`diagnose` with `source` reports static ZIP/configuration validation and marks runtime checking `not-run`. Without a source it observes Studio. Optional `wait_ready_ms` is limited to 30000 and does not start a bundle. Reports distinguish `invalid`, `not-run`, `timeout`, `error` and `observed-ready`; they include the running program, recent stdout/messages and truncation flags. Ready means a CI was observed, not that an arbitrary game is correct.

DOSBox `[LOG_*]` messages retain their original SDK severity in the report, but do not imply failure of the browser backend or stop a stdout wait. Browser backend errors, including `[worker]` and `[panic]`, still produce an error result.

`scenario` accepts up to 128 typed `key`, `mouse`, `button`, `wait` and `state` steps. Keyboard input uses supported DOM numeric keycodes. Mouse coordinates are in the range 0 to 1. Each wait is at most 10000 ms. Supply a nonempty `stdout` substring and `timeout_ms` up to 30000. Held keys and buttons are released when the scenario ends. Arbitrary JavaScript, shell commands and unknown steps are rejected.

`screenshot` returns a PNG from CI image data. Before the first observed frame it returns `no-frame`, not an empty successful image. Studio opts into `runInBackground:true`; ordinary players still default to pausing when hidden. Explicit pause always takes precedence. Browsers can throttle background work and suspend audio until a user gesture. Audio state is reported separately and a browser policy restriction does not prove a game error. `backend-managed` means the native worklet's AudioContext state is not available through the supported CI API; it does not mean audio was disabled or allowed by autoplay policy.

## Standalone projects

`generate` takes `source`, a new `destination` directory and one preset: `html`, `vite`, `react`, `vue` or `angular`. Existing destinations are rejected. Generation stages only its own files and never runs npm. It works without Node.js and returns `buildStatus:not-run` and the next commands.

Each project has its own bundle, local runtime, manifest and notices. HTML needs only an HTTP server, such as `python3 -m http.server 8080 --bind 127.0.0.1`. Framework projects need Node.js 22.12 or newer in the 22 series, or 20.19 or newer in the 20 series. Install dependencies explicitly, then use `npm run dev`, `npm run build` and `npm run preview`. Angular uses a local CLI and publishes `dist/player/browser`; Vite publishes `dist`. Do not use `file://`.

React, Vue and Angular cancel delayed initialization on unmount and call `stop()` on an existing player. `stop()` unmounts UI, removes its root/document listeners and stops pending or active CI. Projects require no MCP process and include no Studio control channel in ordinary development or production. External sockdrive/qcow2 resources are not copied, so their bundle warning must not be described as an offline guarantee.

## Project checks and opt-in preview

`verify_project` reads the selected project's manifest and checks required files and checksums. It does not install packages. Without `allow_build_scripts:true`, the build remains `not-run`. Permission allows `npm run build`, which can execute arbitrary local package scripts. This is not a sandbox. Results distinguish missing dependencies, unavailable toolchain, build failure, timeout and success. There are at most two concurrent builds, each limited to 120 seconds and 64 KiB from each output stream. Process groups on Unix and job objects on Windows terminate descendants on cancellation, timeout and shutdown.

`preview_project` starts only an explicitly requested diagnostic HTTP preview. For HTML or a production build, select its directory. For Vite or Angular development, start the dev server yourself and supply the project directory and its exact `http://127.0.0.1:PORT` origin as `upstream`. Vite's optional hook uses `npm run dev -- --mode diagnostic`; Angular has a separate `npm run dev -- --configuration diagnostic`. Open the URL returned by `preview_project`, not the original dev-server URL.

Preview inserts an early diagnostic script into HTTP responses, without changing project files. It reports `error`, `unhandledrejection`, failed resources and js-dos initialization errors over its own exact-origin, secret-authenticated channel. `report` remains `not-run` until a browser connects. Use `stop` to close the preview. Ordinary builds do not include the injected script, secret or temporary server address. HMR is disabled in Vite and Angular diagnostic modes; preview is not a general WebSocket reverse proxy. Angular's diagnostic polyfill forwards the rejection hook of its pinned Zone.js version. A passing static check without an observed browser is not a passing browser check.

## Limits and local security

The server binds only `127.0.0.1` on an available port. It validates Host, Origin, browser fetch metadata and session secret. A second page cannot replace an active control connection. Responses carry request, session and connection identifiers; late responses from older connections are ignored. A browser request has a 60-second deadline and is never replayed. HTTP serves only embedded resources; preview serves only its selected directory or exact selected loopback dev origin. No browser operation reads an arbitrary computer path.

ZIP transfer is limited to 64 MiB, expanded contents to 256 MiB, and archive/folder entries to 4096. Duplicate and case-conflicting names, traversal, absolute names, links, special files, file/directory collisions and unsafe Windows names are rejected. A control message is at most 90 MiB. Stdout retains the last 65536 characters; messages retain the last 128 entries of up to 4096 characters. Preview retains 128 bounded events. Secrets are excluded from diagnostic output and generated projects. Imported code and DOS programs remain untrusted browser workloads, not native project script permission.

Stdio carries only MCP JSON. Logs use stderr. Closing stdio closes HTTP, control connections, previews and managed build processes. It does not delete exported bundles or generated projects. The browser tab itself is user owned and is not forcibly closed by server shutdown. The pinned Emscripten runtime requires `unsafe-eval` and blob scripts in Studio's otherwise local-only Content Security Policy.

## Build and verify from source

The checked local toolchain is Node.js 22.17.1, Yarn 1.22.22 and Rust/Cargo 1.95.0. The crate declares Rust 1.88 as its minimum, but that minimum has not been tested here. Browser tests use an installed Chrome through CDP only for testing; runtime never needs an automation framework.

```sh
yarn install --frozen-lockfile --ignore-scripts
yarn tsc --noEmit
yarn eslint src test --ext ts,tsx --max-warnings 0
yarn build
yarn build:mcp-assets
cargo fmt --manifest-path mcp/Cargo.toml --check
cargo clippy --manifest-path mcp/Cargo.toml --locked --all-targets -- -D warnings
cargo test --manifest-path mcp/Cargo.toml --locked
cargo build --manifest-path mcp/Cargo.toml --locked --release
node test/stdio.mjs
JSDOS_MCP_BINARY="$PWD/mcp/target/release/jsdos-mcp" yarn test:presets
node mcp/package-release.mjs linux-x86_64
```

Set `CHROME` to the browser executable when it is not `google-chrome`. `test:editor` runs the two backend API checks; `test:mcp` adds MCP/Studio checks; `test:presets` also installs dependencies only inside its own temporary generated projects and checks dev, build, production and component remounts after MCP has stopped. Their temporary directories are removed unless `JSDOS_KEEP_TEST_PROJECTS` is explicitly set. Windows uses the `.exe` path and its shell's environment syntax.

For SDK development only, `JSDOS_TEST_EMULATORS_JS` selects a replacement browser wrapper for the editor tests. It does not replace `node_modules` or embedded resources. Such a run is recorded as `development-sdk` and cannot authorize release packaging. Normal verification uses the published pinned SDK without this override or a local patch.

`build:mcp-assets` starts from source and the locked emulators 8.5.3 package, not an existing root `dist/`. Its dedicated Vite entry and Tailwind input do not use the user's root `index.html` or `/latest`. `mcp/assets/manifest.json` records sizes and SHA-256 hashes. Rust verifies every embedded asset during its build, and a missing required resource fails the build. The native release matrix downloads one shared asset build. The existing js-dos publication workflow is unchanged.

See `sources.json` for immutable emulators, DOSBox, DOSBox-X and libzip revisions. The emulators repository pins its backend submodules; initialize those recursively when rebuilding its WASM. Release archives contain GPL/libzip/browser dependency notices and Rust dependency license files and source metadata. The js-dos/MCP source is the repository at the release tag, with both lockfiles. Keep those sources available when distributing binaries.
