---
id: cloud-overview
slug: /cloud/
title: js-dos cloud 
sidebar_label: Overview 
---
import useBaseUrl from '@docusaurus/useBaseUrl';

js-dos offers cloud services that improves user experience. They includes:

* Storing saves in cloud, that means you can restore your progress on any browser.
* Networking that allows you to play multiplayer dos games.

Cloud service provided by js-dos is free to use. To activate cloud services you need
to provide cliend id to js-dos. 

:::info

If you set client id then js-dos will save [bundle changes](jsdos-save-load.md) in cloud.

:::

To set client id you should supply login function to js-dos options like this:
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

<br/>

`userGesture` variable indicates if login request made by user (`true`) or by js-dos itself. If `userGesture === true` then you can show login dialog, in other case it's better to avoid showing any UI, but it up on you.

If everything is correct you will see current client id in js-dos settings. Also, you will be able to download saves. Like on screenshot:


<img alt="Settings" src={useBaseUrl('img/jsdos-save-backend.jpg')} />