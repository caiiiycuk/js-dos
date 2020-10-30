---
id: command-interface 
title: Command Interface (CI)
---

The `Command Interface` is only one object that allows you to communicate with js-dos instance.
When you run some [js-dos bundle](overview.md#js-dos-bundle) promise to CI is returned.
It will be resolved when js-dos is ready.

```js
const ci = await Dos(/*element*/).run(/*bundle url*/);
```

CI interface:

```typescript
export interface CommandInterface {
    // * get bundle config
    config: () => Promise<DosConfig>;

    // * current render buffer width
    height: () => number;

    // * current render buffer height
    width: () => number;

    // * sound frequency
    soundFrequency: () => number;

    // * `screenshot()` - get screnshot of canvas as ImageData
    screenshot: () => Promise<ImageData>;

    // * `exit()` - exit from runtime
    exit: () => Promise<void>;

    // * `simulateKeyPress(keyCode)` - allows to simulate key press **AND** release event for key code
    // see `sendKeyEvent` to find meaning of keyCode
    simulateKeyEvent: (keyCode: number) => void;

    sendKeyEvent: (keyCode: number, pressed: boolean) => void;

    // dump FS as Uint8Array <zip archive>
    persist(): Promise<Uint8Array>;

    // events
    events(): CommandInterfaceEvents;
}
```

Events interface:
```typescript
export interface CommandInterfaceEvents {
    onStdout: (consumer: (message: string) => void) => void;
    onFrameSize: (consumer: (width: number, height: number) => void) => void;
    onFrame: (consumer: (frame: Uint8Array) => void) => void;
    onSoundPush: (consumer: (samples: Float32Array) => void) => void;
    onExit: (consumer: () => void) => void;
}
```
