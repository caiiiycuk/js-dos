---
id: releases
title: Releases
---

Latest version always available on [github](https://github.com/caiiiycuk/js-dos/releases) and npm repository: 

* **js-dos** - [npm package](https://www.npmjs.com/package/js-dos/v/beta)
* **emulators** - [npm package](https://www.npmjs.com/package/emulators)
* **emulators-ui** - [npm package](https://www.npmjs.com/package/emulators-ui)

If you use npm or yarn, you can obtain the latest version by using `npm install` or `yarn add`.
All files needed to run emulation are placed in the `dist` folder of packages.

You should specify `pathPrefix` variable if scripts are included from non-root path, like this:
```html
<link rel="stylesheet" href="https://js-dos.com/v7/build/releases/latest/js-dos/js-dos.css">
<script src="https://js-dos.com/v7/build/releases/latest/js-dos/js-dos.js"/>
<script>
  emulators.pathPrefix = "/v7/build/releases/latest/js-dos/";
  Dos(document.getElementById("root")).run("some.jsdos");
</script>
```
