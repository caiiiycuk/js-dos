---
id: buttons
title: Buttons
---
import useBaseUrl from '@docusaurus/useBaseUrl';

**emulators-ui** and **js-dos bundles** support adding on screen buttons. 
These buttons can be mapped to key events.

To enable buttons support, you need to add `buttons` section in [jsdos.json](configuration#jsdosjsdosjson).
In that case js-dos will automatically configure buttons support.

**OR**

You can directly create a `button` control like in [Digger](ui-digger) example.

Each button should conform following interface:

```typescript
export type ActionType = "click" | "hold";
// hold - means track press/release events separately

export interface Button {
    action: ActionType,
    mapTo: number,
    symbol?: string,
    position: {
        left?: 1 | 2,
        top?: 1 | 2,
        right?: 1 | 2,
        bottom?: 1 | 2,
    },
}
```

Each side of the screen can snap up to two buttons. For example:
* `{ left: 1, top: 1 }` - button will be placed to left-top corner
* `{ left: 2, top: 1 }` - button will be placed at the top and after previous button

For example, [digger](ui-digger.md) configuration is:
```typescript
const buttons = [
    {
        action: "click",
        mapTo: 88 /*KBD_x*/,
        position: {
            left: 1,
            bottom: 1,
        }
    },
];

emulatorsUi.controls.button(layers, ci, buttons);
```

This snippet will add button "X" in the bottom of screen, when you press it keyboard event for
key "x" will be generated.

## All possible buttons

You can create up to 16 buttons per [layer](multiple-layers.md). Layout of all buttons:
<img alt="all buttons" src={useBaseUrl('img/all-buttons.jpg')} />

:::warning
If you use default js-dos installation then button `13` will be created automatically.
This button will be an options button that gives access to built-in functions (fullscreen, save-load, etc)
<img alt="special button" src={useBaseUrl('img/special-button.jpg')} />
:::

## Changing style

Currently you can change the size of buttons by passing `scale` in layersOptions.
```js
 const layers = emulatorsUi.dom.layers(document.getElementById("root"), { scale: 0.7 });
```

## All buttons example

```html title="examples/all-buttons.html"
{}
```

## GameStudio

You can use [Game Studio](game-studio) to easily configure gestures.
