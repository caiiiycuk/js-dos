---
id: node
title: In node.js
---

In this tutorial we will run Digger game in Node.js and save game screenshot to image.

Let's start with creating empty project:

```sh
npm init
```

In node environment you can use only [emulators](https://www.npmjs.com/package/emulators) package, becuse `emulators-ui` is made for browser integraions. So let's install it.

```sh
npm install --save emulators
```

Next we need to download Digger jsdos bundle:
```sh
curl https://cdn.dos.zone/original/2X/2/24b00b14f118580763440ecaddcc948f8cb94f14.jsdos -o digger.jsdos
```
