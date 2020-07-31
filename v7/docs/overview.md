---
id: overview
title: Overview 
sidebar_label: Overview 
---

:::warning

js-dos v7 is still under development and some features are not ready;
for example you can't use a mouse yet. Please use [js-dos 6.22](https://js-dos.com) for production
projects.

:::

The new version of js-dos is more modular, you can use parts of it. It consists of:
* js-dos bundle - universal package that js-dos understands
* emulators - [npm package](https://www.npmjs.com/package/emulators), that provides just the DOS emulator that can run in different environments
* emulators-ui - [npm package](https://www.npmjs.com/package/emulators-ui), a set of ui and sound components to render emulator output in browser
* js-dos - [npm package](https://www.npmjs.com/package/js-dos/v/beta) that combines everything to run a DOS program in browser

## js-dos bundle

js-dos 6.22 has a very easy API to run a DOS program in browser. Before starting it you need to perform some setup:
* download game archive (usually zip)
* extract it
* configure dos file system
* configure dosbox options (cycles, renderer type, etc.)
* configure controllers (mouse, keyboard type, etc.)

Often gameplay quality depends on good configuration.

Starting from js-dos 7, the API expects a `js-dos bundle` that already contains all configuration needed to start the DOS program.
`js-dos bundle` is just a **ZIP** archive that contains the game itself and a js-dos config file (same as dosbox.conf file). 
For example, [digger.jsdos](https://talks.dos.zone/t/digger-may-06-1999/1922) contains: 
```
.jsdos\dosbox.conf - dosbox configuration file
DIGGER.COM         - game file
```

You can generate a `js-dos bundle` programmatically. But, we recommend you use our [bundle generator](https://dos.zone/en/studio)
Moreover you can search [our database](https://talks.dos.zone/search?expanded=true&q=%23en%20tags%3Ajsdos) to see if someone already uploaded a `js-dos bundle` for a program.

Read the [guide](https://dos.zone/en/guide/studio) about creating `js-dos bundle`.

## Run jsdos file

Once you have `jsdos bundle` you can easily run it in browser. There are several options:

### 1. Use player hosted on dos.zone

Fastest way to embed jsdos on your page. You just need the url of a `jsdos bundle` (you can get it from our game database).

```html
<iframe
  id="jsdos"
  src="https://dos.zone/en/player/https%3A%2F%2Fdoszone-uploads.s3.dualstack.eu-central-1.amazonaws.com%2Foriginal%2F2X%2F9%2F9ed7eb9c2c441f56656692ed4dc7ab28f58503ce.jsdos"
/>
```

The `src` can be composed like this:

```js
const src = "https://dos.zone/en/player/" + encodeURIComponent(bundleUrl);
```

To receive input you should focus the iframe:
```js
document.getElementById("jsdos").focus();
```

Complete example:

```html title="examples/iframe.html"
{}
```

:::info

1. Drag with mouse to play without keyboard!
2. Open top menu to type records name on mobile.

:::

:::warning

Iframe integration didn't support for fullscreen button yet, if you need it look forward.

:::

### 2. Use js-dos api

js-dos v7 is even simple then 6.22, to run `bundle` you just need a one line of code:

```js
Dos(document.getElementById("jsdos")).run("some.jsdos");
```

`Dos` receives HTMLDivElement and uses it to create the player UI. To run `jsdos bundle`
just use its method `run` specifying the url of `jsdos bundle`.

To use js-dos you need to add `js-dos.js` script, and `js-dos.css` style.
Also you need to specify path prefix os js-dos installation:

```html
<script src="/v7/build/releases/latest/js-dos/js-dos.js"></script>
<link href="/v7/build/releases/latest/js-dos/js-dos.css" rel="stylesheet">
// ...
<script>
  emulators.pathPrefix = "/v7/build/releases/latest/js-dos/";
  Dos(/*element*/).run(/*bundleUrl*/);
```

Complete example:

```html title="examples/dos.html"
{}
```

###  3. Using emulators

Most flexible way. The emulators package contains core that can run DOS programs in wasm environment. It now supports two execution modes:
* direct - run DOS emulation inside main browser thread.
* worker - run DOS emulation inside worker thread.

Read the [guide](estimating-performance) to how we use emulators to estimate js-dos performance.
