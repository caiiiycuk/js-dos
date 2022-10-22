---
id: node
title: In node.js
---

In this tutorial we will run Digger game in Node.js and save game screenshot to the image.

Let's start with creating empty project:

```sh
npm init
```

In node environment you can only use [emulators](https://www.npmjs.com/package/emulators) package, because `emulators-ui` is made for browser integrations. For creating screenshot we will use `jimp` library. So let's install them.

```sh
npm install --save emulators jimp
``` 

Next we need to download Digger [js-dos bundle](jsdos-bundle):
```sh
curl https://cdn.dos.zone/original/2X/2/24b00b14f118580763440ecaddcc948f8cb94f14.jsdos -o digger.jsdos
```

Let's create source file `digger.js`. We can run it with this command `node digger.js`

**Use require to import all libraries**
```js
const fs = require("fs");
const jimp = require("jimp");

require("emulators");

const emulators = global.emulators;
emulators.pathPrefix = "./";
```

<br/>

:::info

emulators package does not use export system. It injects itself into global object.
`pathPrefix` is used to locate wasm files it relative to `require` path.

:::

**Now we need to read contents of `jsdos bundle` and start emulation**
```js
const bundle = fs.readFileSync("digger.jsdos");

emulators
    .dosDirect(bundle)
    .then((ci) => {
      // ...
    });
```

When dos emulation starts, we will receive [Command Interface](command-interface), we can use it
to subscribe on frame updates and to send key/mouse events.

```js
    ci.events().onFrame((rgb, rgba) => {
        // use rgb or rgba image data
    });
```

<br/>

:::info
**onFrame** method have two arguments `rgb` and `rgba` image data. One of them is always **null** whilte other is **UInt8ClampedArray**. It depends on used emulator which data it uses rgb or rgba. js-dos for browsers return **rgba** data
with transparent alpha channel.
:::

<br/>

In browser we have frame in RGBA format with transparent alpha, let's fix this and save screenshot:

```js
    const width = ci.width();
    const height = ci.height();
    
    for (let next = 3; next < width * height * 4; next = next + 4) {
        rgba[next] = 255;
    }

    new jimp({ data: rgba, width, height }, (err, image) => {
        image.write("./screenshot.png", () => {
            ci.exit();
        });
    });
```

<br/>

If you execute `node digger.js` it will save the screenshot to `./screenshot.png`.

Full code of `digger.js`:
```js
const fs = require("fs");
const jimp = require("jimp");

require("emulators");

const emulators = global.emulators;
emulators.pathPrefix = "./";

const bundle = fs.readFileSync("digger.jsdos");

emulators
    .dosDirect(bundle)
    .then((ci) => {
        let rgba = new Uint8Array(0);
        ci.events().onFrame((_, _rgba) => {
            rgba = _rgba;
        });

        // capture the screen after 3 sec
        console.log("Will capture screen after 3 sec...");
        setTimeout(() => {
            const width = ci.width();
            const height = ci.height();

            for (let next = 3; next < width * height * 4; next = next + 4) {
                rgba[next] = 255;
            }           

            new jimp({ data: rgba, width, height }, (err, image) => {
                image.write("./screenshot.png", () => {
                    ci.exit();
                });
            });
        }, 3000);
    })
    .catch(console.error);
```
