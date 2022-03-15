---
id: iframe
title: In iframe
---
import useBaseUrl from '@docusaurus/useBaseUrl';

iframe integraion is a fastest way to embed a game on your web page. Open [DOS Zone](https://dos.zone) repository 
and search for game, for example '**Digger**'. Then you need to press on code `</>` button:

<img alt="Code button" src={useBaseUrl('img/code-button.jpg')} />

It will open a frame whith html5 code that **you need to paste on your website**:

<img alt="Code frame" src={useBaseUrl('img/code-frame.jpg')} />


<br/>
<br/>
<br/>

:::info

To receive input you should focus the iframe (by click or using js):
```js
iframe.focus();
```

:::

## Iframe example 

Example of web page that uses iframe integration:

```html title="examples/iframe.html"
{}
```

## Client ID

iframe intergation also support passing client id. To do this you need to 
modify iframe src. Replace `anonymous=1` with `anonymous=0`. In that case
you need handle auth client request in parent window, like this:

```ts
    const clientIdListener = async (e: any) => {
        if (e.data.message !== "dz-client-id") {
            return;
        }
        const gesture = e.data.gesture;

        let user = getLoggedUser();
        if (user === null && gesture) {
            user = await login();
        }

        if (user === null) {
            iframe.contentWindow?.postMessage({
                message: "dz-client-id-response",
            }, "*");
        } else {
            iframe.contentWindow?.postMessage({
                message: "dz-client-id-response",
                namespace: user.namespace,
                id: user.id,
            }, "*");
        }
    };

    window.addEventListener("message", clientIdListener);
```


<br/>

## DOS Zone

Read more about [dos.zone](doszone).
