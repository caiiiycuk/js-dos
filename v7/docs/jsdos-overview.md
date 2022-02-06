---
id: jsdos-overview
title: Overview
---
import useBaseUrl from '@docusaurus/useBaseUrl';

js-dos is built on top of `emulators` and `emulators-ui` packages. It provides full-featured **DOS player** that can be easily installed and used to get your DOS program up and running in browser quickly. js-dos provide many advanced features like multiplayer and cloud gaming support. All available features are enabled for any integration and free.

:::warning

If you want to build custom DOS player, then please use [`emulators` and `emulators-ui`](browser.md#2-using-emulators-ui-without-js-dos-services) packages instead.

:::

## Control bar

Most DOS programs are designed to work on screens with `4:3` aspect ratio, but most modern screens have `16:9` aspect, because of that we have lot amount of unused space in left and right side of screen. So, we decided to add control bar of js-dos to the left side of screen.

<img alt="Control bar" src={useBaseUrl('img/jsdos-bar.jpg')} />

Buttons explanation (from left to right):
* `...` - button to open js-dos settings window
* `Pointer` - mouse emulation mode
* `Mobile` - virtual controls mode
* `Pause` - pause/resume emulation
* `Mute` - mute/unmute sounds
* `Keyboard` - toggle onscreen keyboard
* `Fullscreen` - toggle full screen mode

## Mouse emulation mode

By clicking on pointer icon you can switch between regular mouse emulation and [lock mode](mouse-locking.md).

**In regular mouse emulation mode** you can use addtional **refresh** control to synchronize
dos mouse position and browser mouse poistion.

<img alt="Sync mouse position" src={useBaseUrl('img/mouse-controls-0.jpg')} />

**In lock mouse emulation mode** you can use additional **sensitiviy** control to change sensitivy of mouse movement.

<img alt="Sensitivity" src={useBaseUrl('img/mouse-controls-1.jpg')} />

## Virtual controls mode

By clicking on mobile control icon you can (screenshot: from left to right):
* Completely disable all virtual controls (enabled by default on desktop)
* Enable default virtual controls (enabled by default on mobiles)
* Mirror default virtual controls
* Change size of virtual controls

<img alt="Mobile controls mode" src={useBaseUrl('img/mobile-controls-0.jpg')} />

## Save/Load
js-dos support for storing progress [automatically](jsdos-save-load.md).

## Advanced options

You can pass options object as second parameter as dos constructor:

```
export interface DosPlayerOptions extends DosOptions {
    style?: "default" | "none";
    clientId?: ClientIdSupplier;
    onExit?: () => void;
    noSideBar?: boolean;
    noFullscreen?: boolean;
    noSocialLinks?: boolean;
}
```


* `style` - if you set it to "**none**" then control bar will not be added
* `clientId` - for [storing fs](jsdos-save-load.md) changes in cloud
* `onExit` - if set then exit button will be added, and you will be notified when user exit from emulation
* `noSideBar` - if true - removes `...` button
* `noFullscreen` - if true - removes full screen button
* `noSocialLinks` - if true - do not show links in the bottom of sidebar