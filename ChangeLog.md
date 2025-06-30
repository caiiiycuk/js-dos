This document describes changes between released js-dos versions.

Note that version numbers do not necessarily reflect the amount of changes between versions. A version number reflects a release that is known to pass all tests, and versions may be tagged more or less frequently at different times.

Not all changes are documented here. To examine the full set of changes between versions, you can use git to browse the changes between the tags.

8.3.21 - dev
------------

* Added audioWorklet mode
* Added sockdrive preload modes
* Added information about GLFX status
* Support background rendering (disabled by default)

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