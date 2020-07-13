---
id: releases
title: Releases
---

There is no stable releases of js-dos 7. However, latest version always published here: 
* `https://js-dos.com/v7/build/releases/latest/emulators/emulators.js`
* `https://js-dos.com/v7/build/releases/latest/emulators-ui/emulators-ui.js`

If you use npm or yarn, you can obtain latest version by using `npm install` or `yarn add`.
All files needed to run emulation are placed in `dist` folder of packages.

You should specify `pathPrefix` variable if `emulators.js` included from non-root path, like this:
```
<script src="https://js-dos.com/v7/build/releases/latest/emulators/emulators.js"/>
<script>
  emulators.pathPrefix = "v7/build/releases/latest/emulators/";
</script>
```
