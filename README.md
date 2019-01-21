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
```

![Digger in browser](https://github.com/caiiiycuk/create-dosbox/raw/master/digger.gif)

Or if you have archive wiht dos program you can bootstrap it:
```
npx create-dosbox my-app archive.zip
cd my-app
npm intall
npm start
```

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
