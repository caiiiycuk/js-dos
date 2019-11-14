[js-dos 6.22](https://js-dos.com)
===========

[![Build Status](https://travis-ci.org/caiiiycuk/js-dos.svg?branch=6.22)](https://travis-ci.org/caiiiycuk/js-dos) [![Donate](https://img.shields.io/badge/%E2%98%95-Donate-orange)](https://www.buymeacoffee.com/caiiiycuk)

6.22 is a javascript library that allows you to run DOS programs in browser. js-dos provides nice and easy to use javascript api over dosbox. Try our live <a href="https://js-dos.com/#js-dos-622-demo">examples</a>.

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
npm install
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

You can obtain latest build using this ([versions](http://js-dos.com/#js-dos-622-faq-changing-dosbox-variant)):

 - js-dos api: https://js-dos.com/6.22/current/js-dos.js
 - default version: https://js-dos.com/6.22/current/wdosbox.js
 - emterpreter version: https://js-dos.com/6.22/current/wdosbox-emterp.wasm.js
 - nosync version: https://js-dos.com/6.22/current/wdosbox-nosync.wasm.js

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

## Demo

### Examples

All examples are interactive, read more in [**Examples**](https://js-dos.com/6.22/examples/) sections.

### Demo app
<a href="https://dosify.me">Demo app</a> that allows try js-dos box with your game archive.

### Clients
You can found real use of js-dos on certain websites about dos games.

|[![JS-DOS Games](/games-logo.png)](https://js-dos.com/games/)|[![Dos Games Archive](/dga-logo.png)](https://www.dosgamesarchive.com/play-online/)|[![Emupedia](/emupedia-logo.png)](https://emupedia.net/beta/emuos/)|
|:---:|:---:|:---:|
|[JS-DOS Games](https://js-dos.com/games/)|[Dos Games Archive](https://www.dosgamesarchive.com/play-online/)|[Emupedia](https://emupedia.net/beta/emuos/)|

Please open issue on github if you want to add link for another site that uses js-dos.


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

### Changing dosbox variant

By changing wdosboxUrl (see above) you can select different dosbox variants: 

* `wdosbox.js` - default variant. This version compiled with latest emscripten and in theory should work best.
* `wdosbox-emterp.js` - This version compiled with legacy fastcomp backend, can be useful in rare cases (e.g. if you have problem with default version).
* `wdosbox-nosync.js` - Fastest possible version, but limited. You can't run console programs/shell emulation using it.
* `dosbox.js` - same as dosbox-emterp.js because default version can't be compiled to asm.js
* `dosbox-emterp.js` - same as wdosbox-emterp.js but javascript (asm.js)
* `dosbox-nosync.js` - same as wdosbox-nosync.js but javascript (asm.js)

Also you can choose from profiling version of implementation: `wdosbox-profiling.js`,
`wdosbox-emterp-profiling.js`, `wdosbox-nosync-profiling.js`.

Take in account even if you use wasm version of dosbox it will be automatically fallbacked by javascript version if wasm can't start

Default version have limitation and can't be compiled to asm.js, dosbox-emterp.js will be used as fallback for `wdosbox.js`

```javascript
    Dos(canvas, { wdosboxUrl: "/wdosbox-nosync.js" }).ready(...);
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
You have option to change frequently used parameters through [DosOptions](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-options). For example, you can change `cycles` (amount of instructions DOSBox tries to emulate each millisecond):

```javascript
    Dos(canvas, { cycles: 1000, }) // also can be "auto", "max" 
                                   // look to DosOptions for other paramters
        .ready((fs, main) => ...)
        .catch((message) => console.error(message));
```

To change other parameters you can override it with your config file. To do this you can simply put file named `dosbox.conf` inside root of
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

### If game working too fast

In that case you need decrease amount of `cycles` per second, you can do it through configuration option. Please read
section above.

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
<style>
    canvas {
        width: 1280px; 
        height: 640px;
    }
</style>
<canvas width="640" height="320"></canvas>
```

Rule is simple: `width/height` properties is used by jsdos as native
resolution of game/program, but css `width/height` is for changing real size.
So, for giving example resolution will be 640x320, but canvas size will be 1280x640.

**NOTE**: Currently style attribute inside canvas tag **`<canvas style="...">` will not affect canvas size** because it's under js-dos/emscripten control, and 
when dosbox changes video mode this attribute is vanished. 

### Mouse locking

By default dosbox mouse will follow browser cursor without locking. It means that js-dos will not take exclusive control over mouse pointer. However you can change this behaviour by providing `autolock=true` in 
`dosbox.conf` or through [DosOptions](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-options). Then js-dos will take exclusive control and lock mouse inside js-dos container (you can't leave it). This will happen after first click, and you can unlock mouse by pressing `CTRL+F10` or `ESC`.
```javascript
    Dos(canvas, { autolock: true }).ready((fs, main) => {
        main([...]);
    });
```
** OR **
```javascript
    Dos(canvas).ready((fs, main) => {
        fs.createFile("dosbox.conf", `
            [sdl]
            autolock=true
        `);
        main(["-conf", "dosbox.conf"]);
    });
```    

### Fullscreen

JsDos provides very basic support for entering fullscreen mode. You can request to enter
fullscreen mode using [CommandInterface.fullscreen()](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-ci). 

```js
<button onclick="ci.fullscreen()">Fullscreen</button>
<script>
    Dos(canvas).ready((fs, main) => {
        main([...]).then((ci) => {
            window.ci = ci;
        });
    });
</script>
```

**NOTE:** This function can be called anywhere, but for web security reasons its associated request can only be raised inside the event handler for a user-generated event (for example a key, mouse or touch press/release).

### Multiple dosbox instances on one page

JsDos already support multiple instances, just create new canvas for each jsdos and
instaniate it normally. Like in this [64k demoscene](https://js-dos.com/6.22/64k/index.html) example.

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

**NOTE 3: ** Because content of folder is stored in indexed db original archive is downloaded and extracted only once to avoid rewriting stored content! This means that you can't update it from archive, and of course you can't store different content (from different archives) into one path.

### Using multiple archives at once

This section requires that you read section above. Sometimes need to have multiple persistent folders to run single game.
For example, one for sound drivers another for game it self. It can be done with [`extractAll`](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-fs#dosfs-extractall) method. It accepts array of [`sources`](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-fs#dosfs-dosarchivesource) to extract and extract them in one time. Actually, `extract` method is just syntax shugar and implemented via `extractAll`. 

```
    Dos(canvas).ready((fs, main) => {
        fs.extractAll([
            { url: "ultrsound.zip", mountPoint: "/snd" },
            { url: "game.zip", mountPoint: "/game" },
        }).then(() => {
            main(["-c", "cd game", "-c", "game.exe"])
        });
    });
```



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

### Keyboard in iframe

Normally when you use js-dos in iframe keyboard should work. But remember that iframe must be focused
to receive keyboard events. By default when you click on iframe it recives focus, but if you use 
mouse event listener with prevent default at the end, then iframe will not recieve focus. You can solve
this problem by calling `iframe.focus()` function.

### Simulating keyboard events

You can easily simulate key press and release using [CommandInterface.simulateKeyEvent(keyCode: number, pressed: boolean)](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-ci). Or you can use shortcut for single event `simulateKeyPress(keyCode: number)`, like in example:

```javascript
    Dos(canvas).ready((fs, main) => {
        fs.extract("digger.zip").then(() => {
            main(["-c", "DIGGER.COM"]).then((ci) => {
                ci.simulateKeyPress(37); // left arrow
            })
        });
    });
```

## Supported browsers

Using babel notation: `> 0.25%, not dead, ie >= 11`

## Building

Building process have two steps:

1. You need to build emulation layer (dosbox)
2. You need to build API

### Dosbox

Project uses dosbox as emulation layer for running dos programs. You should build it before building javascript API. To do this you should have emscripten installed in your system and CMake. Build process should be easy if you familar with cmake, just run this commands:
```
// set to llvm backend
mkdir build
cd build
emcmake cmake ..
make wdosbox dosbox wdosbox-sync dosbox-sync

// set to fastcomp backend
mkdir build-emterp
cd build-emterp
emcmake cmake ..
make wdosbox-emterp dosbox-emterp
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

Additionaly you can run same tests on other variants of js-dos (emterp, nosync). BUT, not all tests will pass.

```
firefox dist/test/test-js.html
firefox dist/test/test-emterp.html
firefox dist/test/test-js-emterp.html
firefox dist/test/test-nosync.html
firefox dist/test/test-js-nosync.html
```
