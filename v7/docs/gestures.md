---
id: gestures
title: Gestures
---
import useBaseUrl from '@docusaurus/useBaseUrl';

[Game Studio](game-studio) and `js-dos bundles` support configuring touch controls for mobile.
It can mapp simple gestures like: left, right, up, down swipes and tap for two fingers.

You can configure them on 3rd step of bundles creation.

Digger configuration:
<img alt="Result" src={useBaseUrl('img/gestures_digger.jpeg')} />

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
Syntethic gesture, means that key pressed by (dir or plain) should be released on end of gesture. By default it will be pressed until new gesture is detected.

### tap gesture
When user tap on the screen by finger.

## nipplejs

Under the hood awesome [nipplejs](https://yoannmoi.net/nipplejs/) is used. Many thanks!
