---
id: ui-digger
title: Digger 
---
import useBaseUrl from '@docusaurus/useBaseUrl';

In this example you will learn how to start digger in browser using only
`emulators-ui` components. We will build simple dos player with start/stop functions 
and backend selector.
In the same way you can build your dos player.

<img alt="Result" src={useBaseUrl('img/ui-digger.jpg')} />

For this example you should add `emulators.js`, `emulators-ui.js` and `emulators-ui.css`:
```html
<script src="/v7/build/releases/latest/emulators/emulators.js"></script>
<script src="/v7/build/releases/latest/emulators-ui/emulators-ui.js"></script>
<link rel="stylesheet" href="/v7/build/releases/latest/emulators-ui/emulators-ui.css">
//...
<script>
  emulators.pathPrefix = "/v7/build/releases/latest/emulators/";
```

Complete example:
```html title="examples/ui-digger.html"
{}
```
