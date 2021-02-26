---
id: browser
title: In browser
---

### 1. Using js-dos api

To run `bundle` you just need a one line of code:

```js
Dos(document.getElementById("jsdos")).run("some.jsdos");
```

`Dos` receives HTMLDivElement and uses it to create the player UI. To run `jsdos bundle`
just use its method `run` specifying the url of `jsdos bundle`.

To use js-dos you need to add `js-dos.js` script, and `js-dos.css` style ([releases](releases)).
Also you need to specify path prefix of js-dos installation:

```html
<script src="<path>/js-dos.js"></script>
<link href="<path>/js-dos.css" rel="stylesheet">
// ...
<script>
  emulators.pathPrefix = "<path>/";
  Dos(<element>).run(<bundleUrl>);
```

Complete example:

```html title="examples/dos.html"
{}
```

:::info
By default, js-dos will load wasm modules relatively from current path,
you should specify variable `pathPrefix` if you want to load them from different place:
```js
emulators.pathPrefix = "<some-path>/";
```
:::


###  2. Using emulators-ui

From v7 js-dos npm package is **only a wrapper script** that combines *emulators* and *emulators-ui* packages. It didn't contains
code itself. It's useful if you don't want to make customizations in UI or custom integration. **js-dos package is single
file solution to run DOS programs.**

If you want to make customizations or something special then you need to use *emulators* and  *emulators-ui* package in combination.
They provide absolutely same functions as *js-dos* package and lot more (see [threejs](threejs) integration).

To change code above to use `emulators-ui` just change scripts imports to:
```html
<script src="emulators/emulators.js"></script>
<script src="emulators-ui/emulators-ui.js"></script>
<link rel="stylesheet" href="emulators-ui/emulators-ui.css">
```


Complete example:

```html title="examples/ui-dos.html"
{}
```

You can build [custom DOS player](ui-digger) reusing `emulators-ui` components.

###  3. Using emulators

In case you don't want to use the browser API of js-dos project, you can use just the `emulators` package. Read the [guide](estimating-performance.md) to how we use *emulators* to estimate js-dos performance.
