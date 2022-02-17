---
id: browser
title: In browser
---

### 1. Using js-dos api

To run `bundle` you just need a one line of code:

```js
Dos(document.getElementById("jsdos")).run("some.jsdos");
```

`Dos` receives HTMLDivElement and use it to create the player UI. To run bundle
just use its method `run` specifying the url of jsdos bundle.

To use js-dos you need to add `js-dos.js` script and `js-dos.css` files ([releases](releases)) to
html page.

:::info
By default, js-dos will load wasm modules relatively from current path,
you should specify variable `pathPrefix` if you want to load them from different place:
```js
emulators.pathPrefix = "<some-path>/";
```
:::

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

###  2. Using emulators-ui (without js-dos services)

js-dos v7 is based `emulators` and `emulators-ui` packages. It provide additinal services over this two packages, if you don't need them, then you can use `emulators` and  `emulators-ui` packages directly.

To change code above to use `emulators` and `emulators-ui` just change scripts imports to:
```html
<script src="emulators/emulators.js"></script>
<script src="emulators-ui/emulators-ui.js"></script>
<link rel="stylesheet" href="emulators-ui/emulators-ui.css">
```


Complete example:

```html title="examples/ui-dos.html"
{}
```

###  3. Using emulators

In case you don't want to use the browser API of js-dos project, you can use just the `emulators` package. Read the [guide](estimating-performance.md) to how we use `emulators` to estimate js-dos performance.
