---
id: command-interface 
title: Command Interface (CI)
---

The `Command Interface` is only one object that allows you to communicate with js-dos instance.
Once you run some [js-dos bundle](overview.md#js-dos-bundle) you will recive `Command Interface` instance.

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

    // * `pause()` - pause emulation (also mute all sounds)
    pause: () => void;

    // * `resume()` - resume emulation (also unmute all sounds)
    resume: () => void;

    // * `mute()` - mute all sounds
    mute: () => void;

    // * `unmute()` - unmute all sounds
    unmute: () => void;

    // * `exit()` - exit from runtime
    exit: () => Promise<void>;

    // * `simulateKeyPress(...keyCodes)` - allows to simulate key press **AND** release event for key code
    // see `sendKeyPress` to find meaning of keyCode. Key combination is supported when more than 1 keyCode is set.
    simulateKeyPress: (...keyCodes: number[]) => void;

    // * `sendKeyEvent(keyCode, pressed)` - sends single key (press or release) event to backend
    sendKeyEvent: (keyCode: number, pressed: boolean) => void;

    // * `sendMouseMotion` - sends mouse motion event to backend, position is in range [0, 1]
    sendMouseMotion: (x: number, y: number) => void;

    // * `sendRelativeMotion` - sends mouse motion event to backend, position is absolute diff of position
    sendMouseRelativeMotion: (x: number, y: number) => void;

    // * `simulateMouseButton` - sends mouse button event (press or release) to backend
    sendMouseButton: (button: number, pressed: boolean) => void;

    // * `sendMouseSync` - sends mouse sync event 
    sendMouseSync: () => void;

    // dump **changed** FS as Uint8Array <zip archive>
    persist(): Promise<Uint8Array>;

    // events
    events(): CommandInterfaceEvents;
}
```

Events interface:
```typescript
export type MessageType = "log" | "warn" | "error" | string;

export interface CommandInterfaceEvents {
    onStdout: (consumer: (message: string) => void) => void;
    onFrameSize: (consumer: (width: number, height: number) => void) => void;
    onFrame: (consumer: (rgb: Uint8Array) => void) => void;
    onSoundPush: (consumer: (samples: Float32Array) => void) => void;
    onExit: (consumer: () => void) => void;

    onMessage: (consumer: (msgType: MessageType, ...args: any[]) => void) => void;
}
```
