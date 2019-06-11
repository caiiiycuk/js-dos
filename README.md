[js-dos 6.22](https://js-dos.com)
===========

[![Build Status](https://travis-ci.org/caiiiycuk/js-dos.svg?branch=6.22)](https://travis-ci.org/caiiiycuk/js-dos)

6.22 is a javascript library that allows you to run DOS programs in browser. js-dos provides nice and easy to use javascript api over dosbox. Try our <a href="https://dosify.me">demo app</a>.

You can found previous version here [v3](https://js-dos.com/index_v3.html)

## Bootstrap (NPX)

The fastest way to start with js-dos 6.22 is to use our bootstrap project. You can create simple web page that runs
digger in browser with this commands:
```
npx create-dosbox digger
cd digger
npm install
npm start
--
firefox 127.0.0.1:8080
```

![Digger in browser](https://github.com/caiiiycuk/create-dosbox/raw/master/digger.gif)

Or if you have **ZIP** archive with dos program you can bootstrap it:
```
npx create-dosbox my-app archive.zip
cd my-app
npm intall
npm start
```

## How it works

Bootstrap script will create simple html page, that have canvas element. This canvas is used as render surface (output window) to dosbox. Also this page have a js-dos inialization script.

```javascript
    Dos(canvas).ready((fs, main) => {
        fs.extract("digger.zip").then(() => {
            main(["-c", "DIGGER.COM"])
        });
    });
```

It contains this initialization steps:

* `Dos(canvas)` - will return promise that will be resoled when dosbox is ready
* `ready((fs, main) =>)` - will be called when dosbox is ready to run
    * `fs` provides [API](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-fs) to work with filesystem, we call `extract` to mount archive contents as C:
    * `main` provides an entry point to run dosbox like in shell you should pass
    dosbox command line arguments `main(["-c", "DIGGER.COM"])` means:
```
dosbox -c DIGGER.COM
```

Dos has couple configuration [options](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-options) that you can pass as second argument `Dos(canvas, options)`.

## HTML template

You can have same results if just create simple html page:

```html
<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <title>Digger js-dos 6.22</title>
  <script src="https://js-dos.com/6.22/current/js-dos.js"></script>
  <style>
    canvas {
      width: 640px;
      height: 400px;
    }
  </style>
</head>

<body>
  <canvas id="jsdos"></canvas>
  <script>
    Dos(document.getElementById("jsdos"), { 
        wdosboxUrl: "https://js-dos.com/6.22/current/wdosbox.js" 
    }).ready((fs, main) => {
      fs.extract("https://js-dos.com/6.22/current/test/digger.zip").then(() => {
        main(["-c", "DIGGER.COM"])
      });
    });
  </script>
</body>

</html>
```

## Archives

You can obtain latest build using this links:

 - js-dos client api: https://js-dos.com/6.22/current/js-dos.js
 - dosbox wasm wrapper: https://js-dos.com/6.22/current/wdosbox.js
 - dosbox wasm file: https://js-dos.com/6.22/current/wdosbox.wasm.js

**NOTE**: do not try to use this links to serve your copy of dosbox. Because this links always pointing to latest
version, and newest version can have breaking changes. Is better to use npx bootstrap command (above), or download latest
version from github [releases](https://github.com/caiiiycuk/js-dos/releases) page.


## Npm module

You can use js-dos as npm module.

1) Install module package

```sh
npm install --save js-dos
```

2) Import Dos module with require

```js
require("js-dos");
```

This code will automatically inject Dos function into window object. js-dos module also includes typescript sources.
In typescript environment you can use it with typechecking:

```ts
import { DosFactory } from "js-dos";
require("js-dos");

const Dos = (window as any).Dos as DosFactory;
```

See example of React component in FAQ section

## API Reference

Read about api provided by js-dos in [**API Reference**](https://js-dos.com/6.22/docs/)

## FAQ

### How to pass command line arguments

Dosbox will be runned with command line arguments that passed in main function:
```javascript
    Dos(canvas).ready((fs, main) => {
        main(["arg1", "arg2", ...])
    });
```
Is equivalent to
```
    dosbox arg1 arg2
```

### How to change url to wdosbox.js

You can do this by passing `wdosboxUrl` property as second argument:

```javascript
    Dos(canvas, { wdosboxUrl: "/wdosbox.js" }).ready(...);
```

### How to handle errors

You can handle errors by defining `onerror` property, or by using `catch` of promise.

**`onerror`** style

```javascript
    Dos(canvas, { onerror: (message) => console.error(message); })
```

**`catch`** style

```javascript
    Dos(canvas)
        .ready((fs, main) => ...)
        .catch((message) => console.error(message));
```

**NOTE**: `catch` works only for handling initialization errors

### How to run command before program (autoexec)

You can

1. Override `dosbox.conf` file and write `[autoexec]` section, as explained in next section
2. Or you can simply pass additional command line arguments before you program, like:
   ```
     main(["-c", "<command>", "-c", "DIGGER.COM"]);
   ```

### How to override dosbox.conf

By default js-dos uses builtin dosbox [config](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-conf) file.
However you can override it with your config file. To do this you can simply put file named `dosbox.conf` inside root of
program archive and then pass command line argument to read it `-c dosbox.conf`. Or you can write this file directly from
javascript with [fs.createFile](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-fs#dosfs-createfile).

For example, you can add `[autoexec]` section to print dosbox.conf file:
```javascript
    Dos(canvas).ready((fs, main) => {
        fs.createFile("dosbox.conf", `
            [autoexec]
            mount c .
            c:
            type dosbox~1.con
        `);
        main(["-conf", "dosbox.conf"]);
    });
```

### How to disable js-dos loading UI

By default js-dos will show progress of loading dosbox and extracting archives, but you can disable this feature. To
do this you need define onprogress handler in [DosOptions](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-options)

```javascript
    Dos(canvas, { 
        onprogress: (stage, total, loaded) => {
            console.log(stage, loaded * 100 / total + "%");
        },
    }).ready(...);
```

### How to disable logging to console

By default js-dos will log any message using `console.log`, and any error with `console.error`. To disable this you should
override `log` and `onerror` property

```javascript
    Dos(canvas, { 
        log: (message) => { /**/ },
        onerror: (message) => { /**/ },
    }).ready(...);
```

### Resizing canvas

You can easily resize canvas by changing **css** (style) properties `width` and `height`.
Take attention, you **should not** change width and height properties of canvas.

```html
<canvas width="640" height="320" style="width: 1280px; height: 640px"></canvas>
```

Rule is simple: `width/height` properties is used by jsdos as native
resolution of game/program, but css `width/height` is for changing real size.
So, for giving example resolution will be 640x320, but canvas size will be 1280x640.

### Mouse locking

By default dosbox mouse will follow browser cursor. However you can change this behaviour by providing `autolock=true` in 
dosbox.conf. Then mouse starts follow browser cursor after first click (lock), and you can unlock mouse by pressing `CTRL+F10`.
```javascript
    Dos(canvas).ready((fs, main) => {
        fs.createFile("dosbox.conf", `
            [sdl]
            autolock=true
        `);
        main(["-conf", "dosbox.conf"]);
    });
```    

### Multiple dosbox instances on one page

JsDos already support multiple instances, just create new canvas for each jsdos and
instaniate it normally. Like in this [64k demoscene](/6.22/64k/index.html) example.

### Store user progress between sessions

js-dos file system is in memory file system. It means that every file that you exracted,
or file that created by game (save file, config, etc.) will be lost on browser restart.
However it's possible to create directory in file system that will be synced and stored
inside [indexed db](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API). 
This type of folder will store it's content across browser restarts. You can create as many
folders as you want, all of them will be synced.

But, usually only one folder per game needed. So, simplies way to store game progress is
just extract game archive to different folder (not root `/`). For example:

```javascript
    Dos(canvas).ready((fs, main) => {
        fs.extract("game.zip", "/game").then(() => {
            main(["-c", "cd game", "-c", "game.exe"])
        });
    });
```

As you can see second argument in [`extract`](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-fs#dosfs-extract) method is a path where to extract contents archive, and this path will be automatically mount as persistent (because it's not root `/`).

In other words to store game progress just extract game archive into some folder, and that is.

**NOTE 1: ** Some dos games save game progress when you exit them. If you just close browser before exiting game, some games will lost porgress.

**NOTE 2: ** Do not forget to change directory to correct path before running game.

### Caching js-dos script

No need to cache js-dos scripts, because they are automatically added to indexed db cache, so from every second load js-dos can work in offline mode.


### Taking screenshot

When your program is runned you can take screenshot with special [CommandInterface.screenshot()](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-ci). That is returned by main promise:
```javascript
Dos(canvas).ready((fs, main) => {
    fs.extract("digger.zip").then(() => {
        main(["-c", "DIGGER.COM"]).then((ci) => {
            ci.screenshot().then((data) => {
                const w = window.open("about:blank", "image from canvas");
                w.document.write("<img src='" + data + "' alt='from canvas'/>");
            });
        });
    });
});
```

Data is an ImageData from canvas object

### Exiting from js-dos

Sometimes needed to stop execution of dosbox to free resources or whatever. You can do this with [CommandInterface.exit()](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-ci):
```javascript
Dos(canvas).ready((fs, main) => {
    fs.extract("digger.zip").then(() => {
        main(["-c", "DIGGER.COM"]).then((ci) => {
            ci.exit(); // Will stop execution immediately
        });
    });
});
```

### React component (typescript)

This comonent is only demostrate how you can use js-dos with React framework.

```ts
import React, { useRef, useEffect } from "react";

import { DosFactory } from "js-dos";
require("js-dos");
const Dos = (window as any).Dos as DosFactory;


const JsDos: React.FC = () => {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (ref !== null) {
            const ciPromise = Dos(ref.current as HTMLCanvasElement, {
                wdosboxUrl: "https://js-dos.com/6.22/current/wdosbox.js",
            }).then((runtime) => {
                return runtime.fs.extract("https://js-dos.com/6.22/current/test/digger.zip").then(() => {
                    return runtime.main(["-c", "DIGGER.COM"]);
                });
            });

            return () => {
                ciPromise.then(ci => ci.exit());
            };
        }
    }, [ref]);

    return <canvas ref={ref} />;
}

export default JsDos;
```

Then you can use it as simple html tag ```<JsDos />```

## Building

Building process have two steps:

1. You need to build emulation layer (dosbox)
2. You need to build API

### Dosbox

Project uses dosbox as emulation layer for running dos programs. You should build it before building javascript API. To do this you should have emscripten installed in your system and CMake. Build process should be easy if you familar with cmake, just run this commands:
```
mkdir build
cd build
emcmake cmake ..
make -j4
```

### JavaScript API

You can build javascript API with gulp, just type gulp.
```
gulp
```

Output will be placed in dist folder. Also in dist folder you can find test page, you open it in browser. All test should pass.
```
firefox dist/test/test.html
```
