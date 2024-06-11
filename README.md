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
  
## Demo

* [Win 95](https://v8.js-dos.com) - plain Windows 95 with D3D & 3Dfx
* [DOS.Zone](https://dos.zone) - community portal with 1900+ dos games
* [Multiplayer](https://dos.zone/multiplayer) - multiplayer games (Doom, Heroes 2, etc.)
* [Diablo I](https://dos.zone/diablo-1996/)
* Dune 2000
  [![Watch the video](https://github.com/caiiiycuk/js-dos/assets/1727152/a2b481cb-43b1-44aa-8b71-2181d351bb1a)](https://youtu.be/lhFrAe5YrJE)

## Documentation

* [js-dos 8.xx](https://js-dos.com/overview.html)
* [js-dos 7.xx](https://js-dos.com/v7/build/)
* [js-dos 6.22](https://js-dos.com/index_6.22.html)
* [js-dos 3.xx](https://js-dos.com/index_v3.html)
* [Repository](https://github.com/caiiiycuk/js-dos-docs)

## Development

1. You need to install node dependencies and put `emulators` into `public/emulators`.
```
yarn
cp -rv node_modules/emulators/dist/* public/emulators
```
2. Run `yarn run vite` and open [http://localhost:3000](http://localhost:3000) js-dos is ready!

## Community

* [DOS.Zone](https://dos.zone)
* [Discord](https://discord.com/invite/hMVYEbG)
* [Twitter](https://twitter.com/intent/user?screen_name=doszone_db)
* [Telegram](https://t.me/doszone)
