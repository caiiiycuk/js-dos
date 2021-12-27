---
id: iframe
title: In iframe
---

iframe integraion is a fastest way to embed a program on your page. To do this you can use player hosted on [dos.zone](doszone).
You just need the url of a `jsdos bundle` (you can get it from our game database).

```html
<iframe
  id="jsdos"
  src="https://dos.zone/en/player/https%3A%2F%2Fdoszone-uploads.s3.dualstack.eu-central-1.amazonaws.com%2Foriginal%2F2X%2F2%2F24b00b14f118580763440ecaddcc948f8cb94f14.jsdos"
/>
```

The `src` can be composed like this:

```js
const src = "https://dos.zone/en/player/" + encodeURIComponent(bundleUrl);
```

To receive input you should focus the iframe:
```js
document.getElementById("jsdos").focus();
```

Complete example:

```html title="examples/iframe.html"
{}
```

:::info

Mobile support:
1. Swipe to change direction of digger.
2. Open top menu to type records name on mobile.

:::

:::warning

Iframe integration didn't support a full screen button yet, if you need it look forward.

:::
