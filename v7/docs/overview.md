---
id: overview
title: Overview 
sidebar_label: Overview 
---

:::warning

js-dos v7 is still in under development and some features are not ready.
For example you can't use mouse yet. Please use [js-dos 6.22](https://js-dos.com) for production
projects.

:::

New version of js-dos is more modular, you can use it partially. It consists of:
* js-dos bundle - universal package that js-dos understands
* emulators - [npm package](https://www.npmjs.com/package/emulators), that provide just DOS emulator that can be runned in different environments
* emulators-ui - [npm package](https://www.npmjs.com/package/emulators-ui), a set of ui/sound components to render emulator output in browser
* js-dos - [npm package](https://www.npmjs.com/package/js-dos/v/beta) that combine everything to run DOS program in browser

## js-dos bundle

js-dos 6.22 have very easy API to run DOS program in browser, but to start it you need configure program:
* download game archive (usually zip)
* extract it
* configure dos file system
* configure dosbox options (cycles, renderer type, etc.)
* configre controllers (mouse, keyboard type, etc.)

Often quality of game also depends on good configuration.

Starting from js-dos 7, api expects `js-dos bundle` that already contains all configuration needed to start program.
`js-dos bundle` it's a just **ZIP** archive that contains game it self and js-dos config file (same as dosbox.conf file). 
For example, [digger.jsdos](https://talks.dos.zone/t/digger-may-06-1999/1922): 
```
.jsdos\dosbox.conf - dosbox configuration file
DIGGER.COM         - game file
```

You can generate `js-dos bundle` programmatically. But, we recommend to use our [bundle generator](https://dos.zone/en/studio)
Moreover you can search on [our database](https://talks.dos.zone/search?expanded=true&q=%23en%20tags%3Ajsdos) if someone already uploaded `js-dos bundle` for program.

Read [guide](estimating-performance) about creating `js-dos bundle`.

## Run jsdos file

Once you have `jsdos bundle` you can easily run it in browser. There are several options:

### 1. Use player hosted on dos.zone

Easiest way, no need to write code. You just need url of js-dos (you can get it from game database).

```js live
function runInIframe() {
  function onStart() {
    // playerUrl can be found on page of game
    // e.g. https://talks.dos.zone/t/digger-may-06-1999/1922

    const bundleUrl = "https://doszone-uploads.s3.dualstack.eu-central-1.amazonaws.com/original/2X/9/9ed7eb9c2c441f56656692ed4dc7ab28f58503ce.jsdos";
    const playerUrl = "https://dos.zone/en/player/" + encodeURIComponent(bundleUrl);
    
    document.getElementById("demo-iframe").src = playerUrl;
  };
  
  return (
    <div>
      <iframe id="demo-iframe" class="demo"></iframe>
      <br/>
      <button onClick={onStart}>Start</button>
    </div>
  );
}
```

### 2. Use js-dos api

js-dos v7 is even simple then 6.22, to run `bundle` you just need a one line of code:

```js live
function runWithJsDos() {
  // we need to set prefix where emulator wasm is located
  emulators.pathPrefix = "/v7/build/releases/latest/js-dos/";

  const bundleUrl = "https://doszone-uploads.s3.dualstack.eu-central-1.amazonaws.com/original/2X/9/9ed7eb9c2c441f56656692ed4dc7ab28f58503ce.jsdos";

  let dos = null;
  function onStart() {
    if (!dos) {
      dos = Dos(document.getElementById("demo-jsdos"));
    }
    dos.run(bundleUrl);
  };
  
  function onStop() {
    if (dos) {
      dos.stop();
    }
  };
  
  return (
    <div>
      <div id="demo-jsdos" className="demo"></div>
      <br/>
      <button onClick={onStart}>Start</button>
      <button onClick={onStop}>Stop</button>
    </div>
  );
}
```

### 3. Using emulators

Most flexible way. Emulators package conains core that can run DOS program in wasm environment. Now it supports two execution modes:
* direct - run DOS emulation inside main browser thread.
* worker - run DOS emulation inside worker thread.

Read [guide](estimating-performance) how to create `js-dos bundle` and use it to estimate emulator performance.
