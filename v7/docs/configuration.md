---
id: configuration
title: Configuration
---

As said in [Overview](overview.md) `js-dos bundle` is a **ZIP** archive with game files
and configuration files.

### .jsdos/dosbox.conf

:::note

File `.jsdos/dosbox.conf` is required. js-dos would not start if this file does not exist.

:::

This file is a regular [dosbox configuration](https://www.dosbox.com/wiki/Dosbox.conf). Not
all features are supported, but we will work on it.


### .jsdos/jsdos.json

This file contains additional configuration that does not exist in the dosbox configuration file.
For example, it's used to configure [gestures mapping](gestures). If you used [game studio](game-studio)
to create bundles then it will also contain all information from `dosbox.conf`. And it looks like:

```json
{
// ...
  "gestures": [
    {
      "joystickId": 0,
      "event": "dir:up",
      "mapTo": 265
    },
// ...
```

This file can contain any configuration that you want. You can access it with [Command Interface](command-interface).
For example:
```js
const ci = await Dos(/*element*/).run(/*bundle url*/);
const config = await ci.config();
console.log(config.gestures);
```

This snippet will print information about gestures that config has. It's a very powerful feature, it can be used
to add new optional features to js-dos. Read how to add client-side features in emulators-ui [Contributing](contributing-emulators-ui) guide.
