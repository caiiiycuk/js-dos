# js-dos v8
[![Build](https://github.com/caiiiycuk/js-dos/actions/workflows/build.yml/badge.svg?branch=8.xx)](https://github.com/caiiiycuk/js-dos/actions/workflows/build.yml)

The simplest API to run **DOS/Win** 9x programs in browser or node. js-dos provides full-featured DOS player that can be easily installed and used to get your DOS program up
and running in browser quickly. js-dos provide many advanced features like multiplayer and cloud storage. All available features are enabled for any integration and free.

The key features:
* Works in **worker** or render thread
* Support execution in Node and Browsers
* Multiple backends: DOSBox, DOSBox-X
* Mobile support (v8 - WIP, v7 - production)
* Able to run very big games (like Diablo, etc.)
* Multiplayer support
* Cloud storage
* WebAssembly and pure JS versions
  


[![Watch the video](https://github.com/caiiiycuk/js-dos/assets/1727152/a2b481cb-43b1-44aa-8b71-2181d351bb1a)](https://youtu.be/lhFrAe5YrJE)

## Documentation

[Documentation](https://js-dos.com)

Demo:

[DOS.Zone](https://dos.zone)

## Development

1. You need to install node dependencies and put `emulators@beta` into `public/emulators`.
```
yarn
cp -rv node_modules/emulators/dist/* public/emulators
```
2. Run `yarn run vite` and open [http://localhost:3000](http://localhost:3000) js-dos is ready!
