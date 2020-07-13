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
* emulators - npm package, that provide just DOS emulator that can be runned in different environments
* emulators-ui - npm package, a set of ui/sound components to render emulator output in browser
* js-dos - npm package that combine everything to run DOS program in browser

## js-dos bundle + dos.zone

js-dos 6.22 have very easy API to run DOS program in browser, but to start it you need configure program:
* download game archive (usually zip)
* extract it
* configure dos file system
* configure dosbox options (cycles, renderer type etc)
* configre controllers (mouse, keyboard type, etc.)

Often quality of game also depends on good configuration.

Starting from js-dos 7, api expects `js-dos bundle` that already contains all configuration needed to start program.
`js-dos bundle` it's a just **ZIP** archive that contains game it self and js-dos config file (same as dosbox.conf file). 
For example, `digger.jsdos`: 
```
.jsdos\dosbox.conf - dosbox configuration file
DIGGER.COM         - game file
```

You can generate `js-dos bundle` by your self. But, we recommend to use our bundle generator on [Dos.Zone](https://dos.zone/en/studio)
Moreover you can search on [our database](https://talks.dos.zone/c/en) if someone already uploaded `js-dos bundle` for program.

Read [guide](estimating-performance) about creating `js-dos bundle`.

## emulators

emulators package conains core that can run DOS program in wasm environment. Now it supports two execution modes:
* direct - run DOS emulation inside main browser thread.
* worker - run DOS emulation inside worker thread.

Read [guide](estimating-performance) how to create `js-dos bundle` and use it to estimate emulator performance.
