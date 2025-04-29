This document describes changes between released js-dos versions.

Note that version numbers do not necessarily reflect the amount of changes between versions. A version number reflects a release that is known to pass all tests, and versions may be tagged more or less frequently at different times.

Not all changes are documented here. To examine the full set of changes between versions, you can use git to browse the changes between the tags.

dev version
-----------

* Add F6/F7 quick save/load support for DOSBox-X
* Change UI buttons for quick save/load in DOSBox-X mode
* Fix mouse pointer position calculation
* Change sliders ui

8.3.15 - 29.04.2015
-------------------

* Sockdrive V2 - New version of network drive implementation that improves performance and reliability. Sockdrive v2 is completely backendless and is not compatible with Sockdrive V1. 8.3.14 (https://v8.js-dos.com/8.xx/8.3.14/js-dos.js) is the last version that is compatible with Sockdrive v1.
* Implement `fsDeleteFile` - able to delete files and folders
* Emulators compiled with Emscripten 4.0.2
* js-dos now automatically switch to dark mode if it’s enabled in your system.
* Various UI/UX improvements