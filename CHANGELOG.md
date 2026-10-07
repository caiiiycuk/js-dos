This document describes changes between released js-dos versions.

Note that version numbers do not necessarily reflect the amount of changes between versions. A version number reflects a release that is known to pass all tests, and versions may be tagged more or less frequently at different times.

Not all changes are documented here. To examine the full set of changes between versions, you can use git to browse the changes between the tags.

8.5.3 - 07.10.2026
------------------

* Fixed WebRTC-NET IPX connection lifecycle handling to avoid closing newly connected peers with `Connection is still being established`.
* Improved WebRTC-NET connection and data channel cleanup by using stable ids, bound event handlers, and deleting closed channels and connections from internal maps.
* Added a minimal `index-net.html` IPX-over-WebRTC reproduction page.
* Updated Yandex Cloud deployment instructions to use the dedicated AWS credentials and config files.

8.5.2 - 07.10.2026
------------------

* Fixed keyboard and mouse input breaking in DOS games such as Master of Orion II after the DOSBox-X update by cherry-picking upstream `Fix Windows 3.1 PS/2 mouse regression`: DOSBox-X no longer enables the PS/2 AUX port and IRQ12 at BIOS startup when `biosps2=true`

8.5.1 - 01.10.2026
------------------

* Added a Civilization II sockdrive browser test (`yarn test:browser:civ2`) with a separate CI workflow and README badge. The test is included in `test:all`.
* Fixed sockdrive drives hanging Windows 95 guests (for example Civilization II) after the DOSBox-X update: the sockdrive disk size is now passed to `imageDisk` in bytes instead of KiB.
* Fixed the browser DOSBox-X debugger crashing with `RuntimeError: unreachable` on MCP `RUN`/`VRT` by adding `DEBUG_Loop` to the asyncify list.
* Fixed missing `gl4es` build dependencies for `libdosbox-x-jsdos` and `wdosbox-x-jspi`.

8.5.0 - 28.09.2026
------------------

* Added a DOSBox-X debug worker build with browser MCP/debugger support through `dosboxXDebugWorker` and the `mcpServerPort` backend option.
* Added browser diagnostics and CI coverage for D3DTunnel 3Dfx/WebGL rendering.
* Added worker WebGL state preservation tests and audio worklet regression tests.
* Updated DOSBox-X from `2025.05.03-patch-10-gdd065da31` to `dosbox-x-v2026.08.31-92-g48abd08ee` ([compare](https://github.com/js-dos/dosbox-x/compare/dd065da3111b6dd00abb70820fb750bf36a8d5c2...48abd08ee956aeb786308c6091fd28a328514cc3)) and refreshed the asyncify list.
* Improved browser audio playback when emulation speed changes, including sample-rate handling, pitch stability, underrun recovery, rebuffering, and fade-in/fade-out behavior.
* Improved DOSBox-X mixer output pacing and buffering, including DC bias correction support.
* Improved WebGL frame blits for 3Dfx rendering by preserving GL state and avoiding framebuffer feedback loops.
* Improved Sokol audio output by waiting for available audio buffer space before pushing samples.
* Fixed Voodoo/OpenGL resize handling in DOSBox-X.
* Fixed stale frame updates after frame size changes.
* Fixed out-of-bounds RGBA frame writes in the Sokol protocol path.
* Fixed D3DTunnel browser rendering stability, including spline transition tolerance.
* Fixed sockdrive code in the DOSBox-X update branch.
* Split regular and debug DOSBox-X builds so debugger sources are only included in debug builds.
* Removed the obsolete js-dos DOSBox-X render shim and routed frame updates through the worker protocol path.
* Added the `test:browser:d3dtunnel` script and included Tomb Raider 3Dfx and D3DTunnel checks in `test:all`.

8.4.1 - 13.07.2026
------------------

* Improve sockdrive in direct mode
* Fix for #303
* Fix for #310
* Fix for #426


8.4.0 - 19.06.2026
------------------

* Updated emulators to 8.4.0
* Added full 3Dfx acceleration support in browser through WebGL-backed rendering
* Replaced HumbleNet with WebRTC-NET for browser networking and IPX multiplayer
* Added support for shared network instances
* Added support for starting an IPX server and connecting to an IPX address
* Added audioWorklet mode
* Added experimental JSPI backend support
* Added sockdrive preload modes and improved sockdrive persist handling
* Improved sockdrive range loading reliability
* Added information about GLFX status
* Added support for background rendering (disabled by default)
* Replaced IndexedDB storage with OPFS for bundles and local filesystem changes
* Removed auth/cloud code and added fsChanges hooks for custom save storage
* Added OPFS explorer and storage usage statistics
* Added turbo frame with CPU metrics, speed, cycles, fast forward and frame skip controls
* Added support for fast forward during boot
* Added special keys UI for Alt+Tab and Ctrl+Alt+Del
* Added Simplified Chinese language
* Added support for right mouse button on Bluetooth mice
* Improved pointer events handling and pointer lock with unadjusted movement fallback
* Fixed long mouse click handling with pointer events
* Fixed Pause key handling
* Applied initFs even when url is set
* Disabled speed control when CPU auto-adjust is deselected
* Updated WebAssembly build tooling to Emscripten SDK 5.0.2 and Node.js 22.x
* Removed custom Binaryen override from the build workflow
* Updated deployment documentation and Brotli packaging script

8.3.20 - 31.05.2025
-------------------

* Fixed incorrect toast message when there are no changes to save
* Fixed issue where persist() functions ignore some updates

8.3.19 - 20.05.2025
-------------------

* Updated emulators to 8.3.7
* Fixed disk I/O errors from 8.3.18
* Added Romanian language
* Added confirmation dialog when deleting saves

8.3.18 - 14.05.2025
-------------------

* Fix broken UI in noCloud mode
* Switch to emulators 8.3.6 [dosbox-x 2023.10.06 -> 2025.05.14](https://docs.google.com/document/d/1zx9rEu9sEJxZxZq4ij27Kg-_61yIR5FCGJyHjnXx6RE)

8.3.17 - 13.05.2025
-------------------

* Added keyboard.lock() for "Esc" & "Ctrl+W" keys
* Added UI to download/upload and delete saved games
* Disabled cache for dhry2 test program

8.3.16 - 30.04.2015
-------------------

* Added F6/F7 quick save/load support for DOSBox-X
* Changed UI buttons for quick save/load in DOSBox-X mode
* Fixed mouse pointer position calculation
* Changed sliders UI
* Added sensitivity slider when mouse capture mode is enabled
* In fullscreen mode, sidebar becomes thin
* Added click to lock frame if game is running in capture mode

8.3.15 - 29.04.2015
-------------------

* Sockdrive V2 - New version of network drive implementation that improves performance and reliability. Sockdrive v2 is completely backendless and is not compatible with Sockdrive V1. 8.3.14 (https://v8.js-dos.com/8.xx/8.3.14/js-dos.js) is the last version that is compatible with Sockdrive v1.
* Implement `fsDeleteFile` - able to delete files and folders
* Emulators compiled with Emscripten 4.0.2
* js-dos now automatically switch to dark mode if it’s enabled in your system.
* Various UI/UX improvements
