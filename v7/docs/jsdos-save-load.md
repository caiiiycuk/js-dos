---
id: jsdos-save-load
title: Save/Load
---
import useBaseUrl from '@docusaurus/useBaseUrl';

js-dos supports saving and restoring game progress. You can play game from time to time
without losing progress. It's working automatically while you don't change bundle url.

This feature works by dumping changes of file system into second `bundle` and use it to override original file system on next load. This feature is backed by [CommandInterface](command-interface.md) `persist` function.

Save/Load feature works automatically whenever player press save icon, or exiting the game. However, game itself should support storing progress. Because, **js-dos is only storing changes in file system**.

By default, js-dos store game progress in indexed db of browser. This data can be wiped at any moment by browser.

You can avoid this problem if you provide client id for js-dos. If you set client id then js-dos will save changes in cloud.

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

`userGesture` variable indicates if login request made by user or by js-dos itself. If `userGesture === true` then you can show login dialog, in other case it's better to avoid showing any UI, but it up on you.

If everything is correct you will see current client id in js-dos settings. Also, you will be able to download saves. Like on screenshot:


<img alt="Settings" src={useBaseUrl('img/jsdos-save-backend.jpg')} />
