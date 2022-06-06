---
id: jsdos-save-load
title: Save/Load
---
import useBaseUrl from '@docusaurus/useBaseUrl';

js-dos supports saving and restoring game progress. You can play game from time to time
without losing progress. It's working automatically while you don't change bundle url.

This feature works by dumping changes in file system into second `bundle` and use it to override original file system on next load. You can read more about actual implementation [here](save-load.md).

Save/Load feature works automatically whenever player press save icon, or exiting the game. However, game itself should support storing progress. Because, **js-dos is only storing changes in file system**.

:::warning 

By default, js-dos store game progress in indexed db of browser. This data can be wiped at any moment by browser. You can avoid this problem using js-dos [cloud services](cloud-overview.md).

:::

## How to trigger saving

If you want to trigger saving FS changes, please use this API:

```ts
    const dos = Dos(<element>);
    // ...
    await dos.layers.save();
```
