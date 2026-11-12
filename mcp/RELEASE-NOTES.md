# js-dos MCP

ZIP validation uses zip 9.0.5 with explicit local/central header consistency checks for [GHSA-m665-v7pm-7grj](https://github.com/advisories/GHSA-m665-v7pm-7grj).

Published emulators 8.5.3 is integrated. Native Linux x86_64, Windows x86_64 and macOS Intel/arm64 acceptance passed, including native audio cleanup, all five presets without a local SDK patch and extracted-archive smoke tests. Connection through OpenCode 2.2.5 is verified on Linux; that version has a cold-start readiness race described in the README.

CI run [43047052131](https://github.com/caiiiycuk/js-dos/actions/runs/43047052131), PR head `0372f4487d6d1b1cc181c8eff29b85b41f91cad4`, produced these measured draft artifacts. Exact binary/archive SHA-256 values, browser versions and OS releases are recorded in `acceptance/43047052131.json`. The archives record the tested PR merge commit `0a311e56644b8dbc095fba3587cad2e45f49d811` and a clean working tree. Later documentation changes do not change these historical measurements.

| Target | Executable bytes | Archive bytes |
| --- | ---: | ---: |
| linux-x86_64 | 15618392 | 5982171 |
| windows-x86_64 | 16906752 | 6052627 |
| macos-x86_64 | 15348224 | 5915516 |
| macos-arm64 | 15145952 | 5867979 |

The release contains a local stdio MCP executable with embedded Studio, DOSBox and DOSBox-X workers, libzip and standalone HTML, Vite, React, Vue and Angular templates.

Each archive includes `release.json` with the binary size, SHA-256 and source commit. A separate `.sha256` file covers the archive. Runtime asset sizes and hashes are in `asset-manifest.json`. License notices and immutable upstream source revisions are included beside the executable.

Use the system requirements, OpenCode V2 configuration and permissions described in the included README. No Node.js or Rust toolchain is needed to start the executable. Framework development requires its own explicitly installed Node.js dependencies. Unsigned binaries may need operating system approval.

External sockdrive/qcow2 disks are not included in snapshots or generated projects. Browser autoplay and background throttling policies still apply. CI readiness and browser observations do not prove that an arbitrary game works correctly.

`VERIFICATION.md` distinguishes native CI results from local checks and records the remaining browser and external-resource limitations.
