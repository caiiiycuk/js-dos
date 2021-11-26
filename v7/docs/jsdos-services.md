---
id: jsdos-services
title: Services
---
import useBaseUrl from '@docusaurus/useBaseUrl';

js-dos is built on top of `emulators` and `emulators-ui` packages. It provides additional services that are very useful for making great user experience.
All services are enabled for everyone and for free.

:::warning

If you don't need these services please use [`emulators` and `emulators-ui` packages instead](browser.md#2-using-emulators-ui-without-js-dos-services).

:::

## Control bar

Most DOS programs are designed to work on screens with `4:3` aspect ratio, but most modern screens have `16:9` aspect, because of that we have lot amount of unused space in left and right side of screen. So, we decided to add control bar of js-dos to the left side of screen.

<img alt="Control bar" src={useBaseUrl('img/jsdos-bar.jpg')} />

Buttons explanation (from left to right):
* `...` - button to open js-dos settings window
* `Pointer` - mouse emulation mode
* `Mobile` - mobile controls mode
* `Pause` - pause/resume emulation
* `Mute` - mute/unmute sounds
* `Keyboard` - toggle onscreen keyboard
* `Fullscreen` - toggle fullscreen mode

## Mouse emulation mode

By clicking on pointer icon you can switch between regular mouse emulation and [lock mode](mouse-locking.md).

**In regular mouse emulation mode** you can use addtional **refresh** control to synchronize
dos mouse position and browser mouse poistion.

<img alt="Sync mouse position" src={useBaseUrl('img/mouse-controls-0.jpg')} />

**In lock mouse emulation mode** you can use additional **sensitiviy** control to change sensitivy of mouse movement.

<img alt="Sensitivity" src={useBaseUrl('img/mouse-controls-1.jpg')} />

## Mobile controls mode

By clicking on mobile control icon you can (screenshot: from left to right):
* Completely disable all virtual controls (enabled by default on desktop)
* Enable default virtual controls (enabled by default on mobiles)
* Mirror default virtual controls
* Change size of virtual controls

<img alt="Mobile controls mode" src={useBaseUrl('img/mobile-controls-0.jpg')} />

## Save/Load on backend

By default js-dos store game progress in indexed db of browser. This data can be wiped at any moment by browser.
You can avoid this problem if you provide client id for js-dos. If you set client id then js-dos will save changes
on js-dos backend. 

:::important

**This service is also free to use for anyone**.

:::

To set client id you should supply login funciton to js-dos options like this:
```js
	Dos(<element>, {
		clientId: (userGesture) => {
			if (!userGesture) {
				return Promise.resolve(null); // <-- return cached { namespace, id } or null
			}

			return Promise.resolve({
				namespace: "test", // <-- your namespace
				id: "client", // <-- some id of user
			})
		}
	}).run(<bundleUrl>);
```

`userGesture` variable indicates if login request made by user or by js-dos itself. If `userGesture === true` then you can
show login dialog, in other case it's better to avoid showing any UI, but it up on you.

If everything is correct you will see current clientId in js-dos settings. Also you will be able to download saves.


<img alt="Settings" src={useBaseUrl('img/jsdos-save-backend.jpg')} />

## Advanced options

You can pass options object as second parameter as dos contructor:

```
export interface DosPlayerOptions extends DosOptions {
    style?: "default" | "none";
    hardware?: Hardware;
    clientId?: ClientIdSupplier;
    onExit?: () => void;
    noSideBar?: boolean;
    noFullscreen?: boolean;
    donate?: boolean;
}
```

* `Style` - if you set it to "none" then control bar will not be added
* `onExit` - if set then exit button will be added and you will be notified when user clicks it
* `noSideBar` - if true - removes `...` button
* `noFullscreen` - if true - removes fullscreen button
* `donate` - if true - shows donate button insetad of `...` button