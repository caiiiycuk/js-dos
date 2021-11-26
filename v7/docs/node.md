---
id: node
title: In node.js
---

In this tutorial we will run Digger game in Node.js and save game screenshot to image.

Let's start with creating empty project:

```sh
npm init
```

In node environment you can use only [emulators](https://www.npmjs.com/package/emulators) package, becuse `emulators-ui` is made for browser integraions. For creating screenshot we will use `jimp` library. So let's install them.

```sh
npm install --save emulators jimp
``` 

Next we need to download Digger [js-dos bundle](jsdos-bundle):
```sh
curl https://cdn.dos.zone/original/2X/2/24b00b14f118580763440ecaddcc948f8cb94f14.jsdos -o digger.jsdos
```

We will edit file named `digger.js`. We can run it with this command `node digger.js`

**Use require to import all libraries**
```js
const fs = require("fs");
const jimp = require("jimp");

require("emulators");

const emulators = global.emulators;
emulators.pathPrefix = "./";
```

:::info

emulators package is made for browser, it didn't export anything. It inject itself into global object.
In node `pathPrefix` is relative to `require`

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

When dos emulation starts, we will recive [Command Interface](command-interface), we can use it
to subscribe on frame updates and to send key/mouse events.

```js
    let rgb = new Uint8Array(0);
    ci.events().onFrame((frame) => {
        this.rgb = frame;
    });
```

**Now we have frame, it's in RGB format. We only need to save it to png image:**
```js
    const width = ci.width();
    const height = ci.height();

    const rgba = new Uint8Array(width * height * 4);
    for (let next = 0; next < width * height; ++next) {
        rgba[next * 4 + 0] = rgb[next * 3 + 0];
        rgba[next * 4 + 1] = rgb[next * 3 + 1];
        rgba[next * 4 + 2] = rgb[next * 3 + 2];
        rgba[next * 4 + 3] = 255;
    }

    new jimp({ data: rgba, width, height }, (err, image) => {
        image.write("./screenshot.png", () => {
            ci.exit();
        });
    });
```


If you execute `node digger.js` it will save digger screenshot to `./screenshot.png`.

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
        ci.events().onFrame((frame) => {
            rgba = frame;
        });

        // capture the screen after 3 sec
        console.log("Will capture screen after 3 sec...");
        setTimeout(() => {
            const width = ci.width();
            const height = ci.height();

            const rgba = new Uint8Array(width * height * 4);
            for (let next = 0; next < width * height; ++next) {
                rgba[next * 4 + 0] = rgb[next * 3 + 0];
                rgba[next * 4 + 1] = rgb[next * 3 + 1];
                rgba[next * 4 + 2] = rgb[next * 3 + 2];
                rgba[next * 4 + 3] = 255;
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
