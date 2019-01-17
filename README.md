js-dos 6.22
===========

[![Build Status](https://travis-ci.org/caiiiycuk/js-dos.svg?branch=6.22)](https://travis-ci.org/caiiiycuk/js-dos)

6.22 is brand new version of js-dos, that should solve many problems of previous releases. It under active
development right now.

You can get info about previous (stable) version here [v3](https://github.com/caiiiycuk/js-dos/tree/v3)

Bootstrapping
=============

Just type this to run bootstrap dosbox with digger in browser:
```
npx create-dosbox digger
cd digger
npm install
npm start
```

Building
========

Emulation layer (aka dosbox)
----------------------------
```
mkdir build
cd build
emcmake cmake -GNinja ..
ninja -j4
```


Client layer (JavaScript)
------------------------
```
gulp
```

Running tests
-------------
```
firefox dist/test/index.html
```


Folder structure
================

/dreamlayers-em-dosbox-em-dosbox-svn-sdl2

Is folder for storing ported version of dosbox. It's came from this repository:
```
https://github.com/dreamlayers/em-dosbox/
commit: 4526ed7fa56fc70a5de7b666f97a097c27b9ee9f
```

/js-dos-cpp

If folder with sources that extends functionanlity of dosbox

/js-dos-ts

Api layer written is TypedScript



