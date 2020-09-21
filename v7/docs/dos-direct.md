---
id: dos-direct 
title: DOS Direct 
---

DOS Direct is an emulation backend based on dosbox, you can create it with following command:

```js
const ci = await emulators.dosDirect(bundle);
```

In theory direct version is fastest possible version of emulator backend. But it have strong disadvantage: 
it's working on main browser thread. So it can easily hangs browser for some amount of time, and not very 
responsive.

:::note

[DOS Worker](dos-worker.md) is more preffered version of emulator backend, because it not block the browser.

:::
