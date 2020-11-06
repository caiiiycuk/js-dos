---
id: buttons
title: Buttons
---
import useBaseUrl from '@docusaurus/useBaseUrl';

**emulators-ui** and **js-dos bundles** support adding on screen buttons. 
This buttons can be mapped to key events.

To enable buttons support, you need to add `buttons` section in [jsdos.json](configuration#jsdosjsdosjson).
In that case js-dos will automatically configure buttons support.

**OR**

You can directly create `button` control like in [Digger](ui-digger) example.

Each button should conform following interface:

```typescript
export type ActionType = "click" | "hold";
// hold - means track press/release events separately

export interface Button {
    action: ActionType,
    mapTo: number,
    size?: number,
    symbol?: string,
    style?: ElementCSSInlineStyle;
}
```

For example, digger configuration is:
```typescript
const buttons = [
    {
        action: "click",
        mapTo: 88 /*KBD_x*/,
        style: {
            left: "16px",
            bottom: "32px",
        }
    },
];

emulatorsUi.controls.button(layers, ci, buttons);
```

This snippet will add button "X" in the bottom of screen, when you press it keyboard event for
key "x" will be generated.

## GameStudio

You can use [Game Studio](game-studio) to easily configure gestures.
