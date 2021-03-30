---
id: save-load
title: Save/Load
---

js-dos supports saving and restoring game progress. You can play in game from time to time
without losing progress. It's working automatically while you don't change bundle url.

This feature works by dumping changes in file system into second `bundle` and it to override original file system
on next load. This feature is backed by [CommandInterface](command-interface.md) `persist` function.

You can implement your own save/load feature like this:

```ts
const ci = await Dos(<element>).run(<bundle url>);

// saving
const changesBundle = await ci.persist();

// <new session>

// loading
const ci = await Dos(<element>)
  .run([<bundle url>, 
        URL.createObjectURL(new Blob([changesBundle.buffer])]);

```

## Where progress is stored

While you use default Save/Load feature of js-dos all updates are stored in indexed db `emulators-ui-saves`.
The changes bundle is stored like key value record, where key is a `bundle url` and value is `Uint8Array` from `ci.persist()` call.

All progress will be lost if you change bundle url.


Default implementation:
```typescript title="https://raw.githubusercontent.com/caiiiycuk/js-dos/emulators-ui/src/persist/save-load.ts"
{}
```
