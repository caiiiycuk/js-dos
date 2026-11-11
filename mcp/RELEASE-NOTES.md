# js-dos MCP

Draft only. Published emulators 8.5.3 is integrated. Native Linux, macOS Intel and macOS arm64 jobs pass, including native audio cleanup, all five presets without a local SDK patch and extracted-archive smoke tests. Connection through OpenCode 2.2.5 is verified on Linux; that version has a cold-start readiness race described in the README. Windows verification still fails during temporary Angular directory cleanup, so native release acceptance is incomplete. See `VERIFICATION.md`. The local Linux executable is 15,623,344 bytes.

CI run `42998924538` produced these measured draft artifacts. SHA-256 values are recorded in `VERIFICATION.md`; no release is published and no Windows size is claimed yet.

| Target | Executable bytes | Archive bytes |
| --- | ---: | ---: |
| linux-x86_64 | 15618392 | 5978266 |
| macos-x86_64 | 15348224 | 5912915 |
| macos-arm64 | 15145952 | 5865319 |

The release contains a local stdio MCP executable with embedded Studio, DOSBox and DOSBox-X workers, libzip and standalone HTML, Vite, React, Vue and Angular templates.

Each archive includes `release.json` with the binary size, SHA-256 and source commit. A separate `.sha256` file covers the archive. Runtime asset sizes and hashes are in `asset-manifest.json`. License notices and immutable upstream source revisions are included beside the executable.

Use the system requirements, OpenCode V2 configuration and permissions described in the included README. No Node.js or Rust toolchain is needed to start the executable. Framework development requires its own explicitly installed Node.js dependencies. Unsigned binaries may need operating system approval.

External sockdrive/qcow2 disks are not included in snapshots or generated projects. Browser autoplay and background throttling policies still apply. CI readiness and browser observations do not prove that an arbitrary game works correctly.

The native CI matrix must pass before a tag is published. Local Linux checks and any outstanding native Windows/macOS acceptance are recorded in the source checkout's `mcp/VERIFICATION.md`; no unperformed platform check is implied by a source build.
