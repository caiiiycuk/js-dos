---
id: contributing-emulators-ui
title: Contributing in client-side features
---

To contribute to the `emulators-ui` package do the following:

1. Checkout `emulators-ui` repository
  
  `git clone https://github.com/js-dos/emulators-ui`

2. Install [gulp 4](https://gulpjs.com/)

3. Now you can build everything with `gulp` command

### Adding new client-side features

js-dos has an [optional config](jsdos-bundle) file that you can put in `js-dos bundle`. This
file should be in json format. It can contain any information you want and it accessible from [Command Interface](command-interface):

```js
const ci = await Dos(/*element*/).run(/*bundle url*/);
const config = await ci.config();
```

Let's understand how [layers](mobile-support.md) are implemented in js-dos. 
First, layers have special configuration that stored in `jsdos.json` file, it's looks
like: 

```json
{
// ...
  "layers": [
    {
      "grid": "honeycomb",
      "title": "Layer#0",
      "controls": [
        {
          "row": 0,
//...
```

When js-dos starting it waits until config file is read and configure gestures
layer according to its configuration.
```typescript
async run(bundleUrl: string): Promise<CommandInterface> {
        const bundle = await emulatorsUi.network.resolveBundle(bundleUrl);
        this.ciPromise = emulators.dosWorker(bundle);

        const ci = await this.ciPromise;
        const config = await ci.config();

        // ...
        // (config as any).layers
        // ...
}
```

You can do in same way:
* You can add some information to config file
* You can access it in your client code

Doing this does not require changing the native part of `js-dos`.
