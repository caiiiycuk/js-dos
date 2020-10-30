---
id: contributing-emulators-ui
title: Contributing in client-side features
---

To contribute to the `emulators-ui` package do the following:

1. Checkout `js-dos` repository
  
  `git clone https://github.com/caiiiycuk/js-dos`

2. Switch to `emulators-ui` branch

  `git checkout -b dev origin/emulators-ui`
  
3. Install [gulp 4](https://gulpjs.com/)

4. Now you can build everything with `gulp` command

### Adding new client-side features

js-dos has an [optional config](configuration) file that you can put in `js-dos bundle`. This
file should be in json format. It can contain any information you want and it accessible from [Command Interface](command-interface):

```js
const ci = await Dos(/*element*/).run(/*bundle url*/);
const config = await ci.config();
```

Let's understand how gestures are implemented in js-dos. 
First of all, gestures have special configuration that stored in `jsdos.jsdos` file, it's looks
like: 

```json
{
// ...
  "gestures": [
    {
      "joystickId": 0,
      "event": "dir:up",
      "mapTo": 265
    },
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
        emulatorsUi.controls.nippleArrows(this.layers, ci, (config as any).gestures);
        // ...
}
```

You can do in same way:
* You can add some information to config file
* You can access it in your client code

Doing this does not require changing the native part of `js-dos`.
