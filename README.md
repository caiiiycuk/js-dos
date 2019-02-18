[js-dos 6.22](https://js-dos.com)
===========

[![Build Status](https://travis-ci.org/caiiiycuk/js-dos.svg?branch=6.22)](https://travis-ci.org/caiiiycuk/js-dos)

6.22 is a javascript library that allows you to run DOS programs in browser. js-dos provides nice and easy to use javascript api over dosbox.

You can found previous version here [v3](https://js-dos.com/index_v3.html)

## Bootstrap

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
    * `fs` provides [API](https://js-dos.com/docs/generate?js-dos-ds) to work with filesystem, we call `extract` to mount
    archive contents as C:
    * `main` provides an entry point to run dosbox like in shell you should pass
    dosbox command line arguments `main(["-c", "DIGGER.COM"])` means:
```
dosbox -c DIGGER.COM
```

Dos has couple configuration [options](http://js-dos.com/6.22/docs/api/generate.html?page=js-dos-options) that you can pass as second argument.

## API Reference

Read more how to use js-dos in [**API Reference**](http://js-dos.com/6.22/docs/)

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

By default js-dos uses builtin dosbox [config](http://js-dos.com/6.22/docs/api/generate.html?page=js-dos-conf) file.
However you can override it with your config file. To do this you can simply put file named `dosbox.conf` inside root of
program archive and then pass command line argument to read it `-c dosbox.conf`. Or you can write this file directly from
javascript with [fs.createFile](http://js-dos.com/6.22/docs/api/generate.html?page=js-dos-fs#dosfs-createfile).

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
do this you need define onprogress handler in [DosOptions](http://js-dos.com/6.22/docs/api/generate.html?page=js-dos-options)

```javascript
    Dos(canvas, { 
        onprogress: (stage, total, loaded) => {
            console.log(stage, loaded * 100 / loaded + "%");
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
firefox dist/test/index.html
```
