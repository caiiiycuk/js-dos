---
id: dosbox-direct 
title: DOSBOX Direct 
---

DOS Direct is an emulation backend based on dosbox, you can create it with following command:

```js
const ci = await emulators.dosboxDirect(bundle);
```

In theory the direct version is the fastest possible version of the emulator backend. But it has a strong disadvantage: it's working on the main browser thread. So it can easily hang a browser for some amount of time, and not be very responsive.

:::note

[DOSBOX Worker](dosbox-worker.md) is a more preferred version of the emulator backend, because it does not block the browser.

:::

### Accessing file system

In direct mode you can easily access emscripten module:

```js
const ci = await emulators.dosboxDirect(bundle);
ci.transport.module // <-- emscripten module
```

Emscripten module provide lowlevel api to change [file system](https://emscripten.org/docs/api_reference/Filesystem-API.html):

```js
const ci = await emulators.dosboxDirect(bundle);
ci.transport.module.FS // <-- emscripten FS api
```

You can also rescan DOS devices:
```js
const ci = await emulators.dosboxDirect(bundle);
ci.transport.module._rescanFilesystem();
```

### Accessing memory

In direct mode you can dump whole memory of dos:

```js
const ci = await emulators.dosboxDirect(bundle);
ci.transport.module._dumpMemory(copyDosMemory);
ci.transport.module.memoryContents // <-- now you can access contents using this var
```

If you need to copy entire memory pass `true` as argument.
The `memoryContents` contains following:


```js
{
        "memBase": ...,
        "ip": ...,
        "flags": ...,
        "registers": {
            "ax": ...,
            "cx": ...,
            "dx": ...,
            "sp": ...,
            "bp": ...,
            "si": ...,
            "di": ...
        },
        "segments_values": {
            "es": ...,
            "cs": ...,
            "ss": ...,
            "ds": ...,
            "fs": ...,
            "gs": ...
        },
        "segments_physical": {
            "es": ...,
            "cs": ...,
            "ss": ...,
            "ds": ...,
            "fs": ...,
            "gs": ...
        },
        "numPages": ...,
        "memoryCopy": ...
}
```

### Pausing execution

In direct mode, you can pause the Dosbox execution loop without pausing the
emscripten loop.  This lets you pause and inspect the current memory, for
instance.

```js
const ci = await emulators.dosboxDirect(bundle);
ci.transport.module._pauseExecution(true);
```

The `_pauseExecution` function takes as its argument whether it should be
paused or should resume.  To resume once you have completed:

```js
ci.transport.module._pauseExecution(false);
```
