---
id: overview
slug: /
title: Overview 
sidebar_label: Overview 
---
import useBaseUrl from '@docusaurus/useBaseUrl';

js-dos was designed from the ground up to be easily installed and used to get your DOS program up and running in browser quickly.

js-dos v7 includes:
<img alt="Result" width="400px" align="right" src={useBaseUrl('img/jsdos-stack.png')} />

* **js-dos bundle** - universal package format that js-dos understands
* **js-dos** (top layer) - [npm package](https://www.npmjs.com/package/js-dos/v/beta) that combines everything to run a DOS program in browser. js-dos provide additional services like storing saves on backend.
* **emulators-ui** (middle layer) - [npm package](https://www.npmjs.com/package/emulators-ui), a set of virtual controls and sound components to render emulator output in browser. 
* **emulators** (bottom layer) - [npm package](https://www.npmjs.com/package/emulators), that provide emulator backends which can work in different environments.

You can use this three layers separetely. For example:
* you can use only `emulators` package to run [DOS on node](node.md)
* or you can use `emulators-ui` package to build custom [DOS player on three.js](threejs.md). Moreover js-dos package is built using `emulators` + `emulators-ui` packages
* **in most cases using `js-dos` package is simplest way to run [DOS in browser](create-dosbox.md)**

## Bundles repository

Visit our [repository](https://dos.zone) that contains **1900+** already created bundles of dos games. You can [contribute](https://talks.dos.zone/t/read-first/44582) in it.

## Getting started

Once you have a `jsdos bundle` you can easily run it. To do this follow on site getting started menu.
