---
id: mouse-locking
title: Mouse locking
---
import useBaseUrl from '@docusaurus/useBaseUrl';

Some DOS games do not respect the mouse cursor position, they take into account only relative movement of the mouse cursor. This type of game requires a mouse locking feature.

When the mouse is locked DOS game receive only relative movement of mouse and cursor can't leave game screen. This often used inf FPS games like DOOM to look around.

:::info

Mouse lock feature is compatible with mobile devices. In locked mode finger swipe will be sent as relative movement of game cursor.

:::

To activate mouse locking just enable the `autolock` property in dosbox config. Mouse will be locked automatically when you click on the game screen.

<img alt="autolock" src={useBaseUrl('img/autolock.jpg')} />