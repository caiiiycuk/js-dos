# js-dos
[![Build](https://github.com/caiiiycuk/js-dos/actions/workflows/build.yml/badge.svg?branch=8.xx)](https://github.com/caiiiycuk/js-dos/actions/workflows/build.yml)

The simplest API to run **DOS/Win 9x** programs in browser or node.

js-dos is a frontend for [emulators](https://github.com/caiiiycuk/emulators) that provides nice UI and infrastructure
to run DOS or Windows programs in browser.

It provides full-featured **DOS player** that can be easily installed and used to get your DOS program up and running in
browser quickly. js-dos provides many advanced features like multiplayer, save/load, and large disk streaming.
All available features are enabled for any integration and free.

The unique capabilities:
* The only browser solution with accelerated [**3Dfx**](https://js-dos.com/3dfx.html) rendering through a WebGL-backed renderer
* Full [**IPX** networking](https://js-dos.com/networking.html) stack in browser, powered by WebRTC-NET, with IPX server creation, direct
  peer/alias connections, and shared network instances
* **Windows 9x** support through DOSBox-X, including prebuilt Windows 95/98 system images and support for Windows games
  with DirectX and 3Dfx drivers
* **Sockdrive V2** for large disk images: backendless streaming drives, preload modes, and improved persistence handling
* Modern local persistence based on **OPFS**, with local filesystem changes, storage usage information, and `fsChanges`
  hooks for custom save storage

The key features:
* Works in **worker** or render thread
* Support execution in Node and Browsers
* Multiple backends: DOSBox, DOSBox-X
* Mobile support (v8 - WIP, v7 - production)
* Able to run huge games (like Diablo, etc.)
* Multiplayer support
* Save/load support with local persistence and custom storage integrations
* WebAssembly and pure JS versions
* AudioWorklet mode and experimental JSPI backend support
* [Turbo controls](https://js-dos.com/turbo.html) with CPU metrics, speed, cycles, fast forward, and frame skip controls

> If you want to build custom DOS player, then please use [emulators](https://js-dos.com/threejs.html) packages instead.

## Demo

* [DOS.Zone](https://dos.zone) - community portal with 1900+ dos games
* [3Dfx](https://dos.zone/3dfx/)
* [Multiplayer](https://dos.zone/mp)
* [NFS](https://dos.zone/the-need-for-speed-sep-1995/)
* [Age Of Empries II](https://dos.zone/age-of-empires2/)

## Documentation

* [js-dos 8.xx](https://js-dos.com/overview.html)
* [js-dos 7.xx](https://js-dos.com/v7/build/)
* [js-dos 6.22](https://js-dos.com/index_6.22.html)
* [js-dos 3.xx](https://js-dos.com/index_v3.html)

## Support

| [Subscription / Подписка](https://cloudsdk.dev/)                                   | [Visa / MasterCard / МИР](https://pay.cloudtips.ru/p/894f907b) | [Buy Me A Coffee!](https://buymeacoffee.com/caiiiycuk) |
|------------------------------------------------------------------------------------|-----------------------------------------------------------------|--------------------------------------------------------|
| <img src="https://dos.zone/assets/qr-jsdos.png" alt="js-dos qr code" width="128" /> | <img src="https://cdn.dos.zone/custom/qr/cloud_tips_256.png" alt="cloud tips qr code" width="128" /> | <img src="https://cdn.dos.zone/custom/qr/bmc_qr_256.png" alt="bmc qr code" width="128" /> |
| js-dos                                                                             | Cloud Tips                                                      | @caiiiycuk                                             |

| BTC | ETH |
|-----|-----|
| <img src="https://cdn.dos.zone/custom/qr/btc_pub_256.png" alt="btc qr code" width="128" /> | <img src="https://cdn.dos.zone/custom/qr/eth-qr_256.png" alt="eth qr code" width="128" /> |
| 1EngssY81sziuQyb9JGXURG3WDajyC8kW6 | 0x54FEBE29Cd700f88468032b33c33CdcD7c7cCa53 |


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
* [Telegram](https://t.me/doszonechat)
