---
id: threejs 
title: Three.js 
---

## Using emulators-ui components 

`emulators-ui` is a set of components that used to create js-dos player. You can use them one by one. In this example you will learn how to use parts of `emulators-ui` with `three.js` renderer.

For this example you should add `emulators.js` and `emulators-ui.js`:
```html
<script src="/v7/build/releases/latest/emulators/emulators.js"></script>
<script src="/v7/build/releases/latest/emulators-ui/emulators-ui.js"></script>
<script>
  emulators.pathPrefix = "/v7/build/releases/latest/emulators/";
```

Complete example:
```html title="examples/threejs.html"
{}
```

## EmulatorsUi components

### emulatorsUi.network.resolveBundle

Abstraction over XHR to download bundles by url
```js
const bundle = await emulatorsUi.network.resolveBundle(<url>);
```

### emulatrosUi.sound

Default audio processor, it will play sound using AudioNode
```js
emulatorsUi.sound.audioNode(<command-interface>);
```

### emulatorsUi.controls.domToKeyCode

This function transfrom DOM keyCode to jsdos keyCode.
```js
const jsdosKeyCode = emulatorsUi.controls.domToKeyCode(<dom-keycode>);
```

### ...

```js
export class EmulatorsUi {
    dom = {
        layers, // DOM components that used by js-dos player
    };

    network = {
        resolveBundle, // GET request to download bundles
    };

    graphics = {
        webGl, // default webgl renderer
    };

    sound = {
        audioNode, // default audio processor
    };

    controls = {
        domToKeyCode, // function to convert DOM keycodes into dosbox keycodes
        keyboard, // default keyboard processor
        nippleArrows, // touch joystick translated to arrow keys
    };
};
```
