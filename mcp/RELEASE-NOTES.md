# js-dos MCP

Draft only. Published emulators 8.5.3 is integrated and Linux checks pass, including native audio cleanup, all five presets without a local SDK patch, normalized project-root validation, an extracted-archive smoke test and connection through OpenCode 2.2.5. That OpenCode version has a cold-start readiness race described in the README. Native release acceptance is incomplete. See `VERIFICATION.md`. The rebuilt Linux executable is 15,623,344 bytes; Windows/macOS sizes have not been measured.

The release contains a local stdio MCP executable with embedded Studio, DOSBox and DOSBox-X workers, libzip and standalone HTML, Vite, React, Vue and Angular templates.

Each archive includes `release.json` with the binary size, SHA-256 and source commit. A separate `.sha256` file covers the archive. Runtime asset sizes and hashes are in `asset-manifest.json`. License notices and immutable upstream source revisions are included beside the executable.

Use the system requirements, OpenCode V2 configuration and permissions described in the included README. No Node.js or Rust toolchain is needed to start the executable. Framework development requires its own explicitly installed Node.js dependencies. Unsigned binaries may need operating system approval.

External sockdrive/qcow2 disks are not included in snapshots or generated projects. Browser autoplay and background throttling policies still apply. CI readiness and browser observations do not prove that an arbitrary game works correctly.

The native CI matrix must pass before a tag is published. Local Linux checks and any outstanding native Windows/macOS acceptance are recorded in the source checkout's `mcp/VERIFICATION.md`; no unperformed platform check is implied by a source build.
