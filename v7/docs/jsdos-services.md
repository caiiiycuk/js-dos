---
id: jsdos-services
title: Services
---
import useBaseUrl from '@docusaurus/useBaseUrl';

js-dos is built on top of `emulators` and `emulators-ui` packages. It provides additional services that are very useful for making great user experience.
All services are enabled for everyone and for free.

:::important

If you don't need these services please use [`emulators` and `emulators-ui` packages instead](browser.md#2-using-emulators-ui-without-js-dos-services).

:::

## Control bar

js-dos have addional control bar on top:
<img alt="Control bar" src={useBaseUrl('img/jsdos-bar.jpg')} />

It has following styles:
* `default` - light theme
* `dark` - dark theme
* `none` - completely hide this bar. However it's not recommended, please read important notice above.

Also you can change the title (js-dos), using this code:

```js
	Dos(<element>, {
		title: "myDos",
		style: "dark",
	});
```

Buttons explanation (from left to right):
* `Options` - button to open js-dos settings
* `Mobile` - toggle virtual (mobile) controls
* `Pause` - pause/resume emulation
* `Mute` - mute/unmute sounds
* `Keyboard` - toggle onscreen keyboard
* `Save` - current FS changes in indexed db or backend
* `Fullscreen` - toggle fullscreen mode

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

If everything is correct you will see current clientId in js-dos settings. Also you will be able to download and upload saves.


<img alt="Settings" src={useBaseUrl('img/jsdos-save-backend.jpg')} />
