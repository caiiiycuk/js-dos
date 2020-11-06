---
id: mapper
title: Mapper
---

**emulators-ui** and **js-dos bundles** support adding keyboard mapping. With this feature you can
remap one key to another.

To enable mapper support, you need to add `mapper` section in [jsdos.json](configuration#jsdosjsdosjson).
In that case js-dos will automatically configure mapper support.

**OR**

You can directly pass `mapper` object to `keyboard` control like in [Digger](ui-digger) example.

Mapper should conform following interface:

```typescript
export type Mapper = {[keyCode: number]: number};
```

For example, digger configuration is:
```typescript
const mapper = {
    88/*KBD_x*/: 290 /*KBD_f1*/,
};

emulatorsUi.controls.keyboard(layers, ci, mapper);
```

This snippet will map button "X" to button "F1" which is fire for digger.

## GameStudio

You can use [Game Studio](game-studio) to easily configure gestures.
