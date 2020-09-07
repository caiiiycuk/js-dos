---
id: control-bar
title: Control Bar
---
import useBaseUrl from '@docusaurus/useBaseUrl';

Default js-dos interface includes `control bar` component. It can be opened by pressing 
on `▼` button. This bar implement some useful actions that needed very often:

* Text input field for sending textual data on mobile devices
* [Save](save-load.md) feature
* Fullscreen button that toggles fullscreen on supported browsers


<img alt="Result" src={useBaseUrl('img/control-bar.jpg')} />

## Detaching

If you don't like the style of control bar or you need to place it somewhere else then you can detach it. To do this you need to provide optional `controlSelector` parametr to `Dos` function.

Control selector interface:
```typescript
export interface ControlSelector {
    input: () => HTMLInputElement;
    send: () => HTMLElement;
    save: () => HTMLElement;
    fullscreen: () => HTMLElement;
}
```

* **input** must return `<input>` element to read text from
* **send** is a clickable element that triggers reading from *input*
* **save** is a clickable element that triggers save feature
* **fullscreen** is a clickable element that toggles fullscreen 

Complete example:
```html title="examples/control-bar-detach.html"
{}
```
