---
id: multiple-layers
title: Multiple layers
---

import useBaseUrl from '@docusaurus/useBaseUrl';

Layer is a conjunction of [Mapper](mapper), [Gestures](gestures) and [Buttons](buttons). Look the video how it works in real game.

<iframe width="560" height="315" src="https://www.youtube.com/embed/iEaRErl76jM?start=35" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Layer information are stored inside [jsdos.json](configuration#jsdosjsdosjson) file and generated with Dos.Zone [game studio](game-studio).

Often one layer is enough for a game, but sometimes the game has a complex UI that requires changing layers between scenes. In that case you can attach multiple layers to the game and then switch between them when needed.

Golden Axe one such game, take a look how it works.


```html title="examples/ui-layers.html"
{}
```
