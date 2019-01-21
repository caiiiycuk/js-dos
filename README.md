js-dos 6.22
===========

[![Build Status](https://travis-ci.org/caiiiycuk/js-dos.svg?branch=6.22)](https://travis-ci.org/caiiiycuk/js-dos)

6.22 is a javascript library that allows you to run DOS programs in browser. js-dos provides nice and easy to use javascript api over dosbox.

You can found previous version here [v3](https://github.com/caiiiycuk/js-dos/tree/v3)

Bootstrap
=========

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

How it works
------------

This script will create simple html page, that have canvas element. This canvas is used as render surface (output window) to dosbox. Also this page have a js-dos inialization script.

```javascript
    Dos(canvas).ready((fs, main) => {
        fs.extract("digger.zip").then(() => {
            main(["-c", "DIGGER.COM"])
        });
    });
```

It contains this initialization steps:
1. Dos(canvas) - will return promise that will be resoled when dosbox is ready
2. ready((fs, main) =>) - will be called when dosbox is ready (**BUT NOT RUNNED**)
3. fs allows you to do work over dosbox filesystem, and we ask to download and extract "digger.zip"
4. When archive is extracted we run dosbox, like in shell ```main(["-c", "DIGGER.COM"])``` is equivalent to:
```
> dosbox -c DIGGER.COM
```

Read more how to use js-dos in [**API Reference**](http://js-dos.com/6.22/6.22.7/docs/api/js-dos-ts/js-dos.html)

Building
========

Building process have two steps:

1. You need to build emulation layer (dosbox)
2. You need to build API

Dosbox
------
Project uses dosbox as emulation layer for running dos programs. You should build it before building javascript API. To do this you should have emscripten installed in your system and CMake. Build process should be easy if you familar with cmake, just run this commands:
```
mkdir build
cd build
emcmake cmake ..
make -j4
```

JavaScript API
--------------

You can build javascript API with gulp, just type gulp.
```
gulp
```

Output will be placed in dist folder. Also in dist folder you can find test page, you open it in browser. All test should pass.
```
firefox dist/test/index.html
```
