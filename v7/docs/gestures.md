---
id: gestures
title: Gestures
---
import useBaseUrl from '@docusaurus/useBaseUrl';

**emulators-ui** and **js-dos bundles** support configuring touch controls for mobile.
It can map simple gestures like: left, right, up, down swipes and tap for two fingers.

To enable gestures support, you need to add `gestures` section in [jsdos.json](jsdos-bundle#jsdosjsdosjson).
In that case js-dos will automatically configure gestures support.

**OR**

You can directly create `nipple` control like in [Digger](ui-digger) example.

Each gesture should conform following interface:

```typescript
export type Event =
    "dir:up" | "dir:down" | "dir:left" | "dir:right" |
    "plain:up" | "plain:down" | "plain:left" | "plain:right" |
    "end:release" | "tap";

export interface EventMapping {
    joystickId: 0 | 1,
    event: Event,
    mapTo: number;
}
```

For example, digger configuration is:
```typescript
const mapping = [
    { joystickId: 0, event: "dir:up", mapTo: 265 /*KBD_up*/ },
    { joystickId: 0, event: "dir:down", mapTo: 264 /*KBD_down*/ },
    { joystickId: 0, event: "dir:left", mapTo: 263 /*KBD_left*/ },
    { joystickId: 0, event: "dir:right", mapTo: 262 /*KBD_right*/ },
    { joystickId: 0, event: "tap", mapTo: 290 /*KBD_f1*/ },
    { joystickId: 1, event: "tap", mapTo: 290 /*KBD_f1*/ },
];

emulatorsUi.controls.nipple(layers, ci, mapping);
```

Digger configuration:
* Moving finger up will map to key "UP".
* Moving finger left will map to key "LEFT".
* Moving finger right will map to key "RIGHT".
* Moving finger down will map to key "DOWN".
* Tap with finger will map to key "F1"

## Supported gestures

### dir gesture
When a direction is reached after the threshold. Direction are split with a 45° angle.
```
//     \  UP /
//      \   /
// LEFT       RIGHT
//      /   \
//     /DOWN \
```

### plain gesture
When a plain direction is reached after the threshold. Plain directions are split with a 90° angle.
```
//       UP               |
//     ------        LEFT | RIGHT
//      DOWN              |
```
### end:release
Synthetic gesture, means that the key pressed by (dir or plain) should be released at the end of gesture. By default it will be pressed until a new gesture is detected.

### tap gesture
When the user taps on the screen by finger.

## GameStudio

You can use [Game Studio](jsdos-bundle#game-studio) to easily configure gestures.

## nipplejs

Under the hood awesome [nipplejs](https://yoannmoi.net/nipplejs/) is used. Many thanks!
