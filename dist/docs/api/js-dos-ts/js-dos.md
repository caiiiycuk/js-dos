











# Example
```javascript
Dos(canvas).ready((fs, main) => {
    fs.extract("digger.zip").then(() => {
        main(["-c", "DIGGER.COM"])
    });
});
```
Dos function is entry point that provides emulation layer.
As emulation layer js-dos uses [DosBox ported to emscripten](https://github.com/dreamlayers/em-dosbox/#compiling).








# Dos


  

```

import openCache from "./js-dos-cache";
import { DosCommandInterface } from "./js-dos-ci";
import { DosFS } from "./js-dos-fs";
import { Host } from "./js-dos-host";
import { DosModule } from "./js-dos-module";
import { DosOptions } from "./js-dos-options";

import Move from "./controller/move";
import Qwerty from "./controller/qwerty";


```







When you call `Dos(canvas, options)` js-dos behind the scene will download
dosbox and prepare it to start. This function will return `Promise<DosReadyPromise>`
that will be resolved when dosbox is ready. In case of error promise
will be rejected.

* `canvas`: HTMLCanvasElement - this canvas element is used as window for dosbox
* `options`: [DosOptions](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-options) -
optional configuration object


  

```
export type DosFactory = (canvas: HTMLCanvasElement, options?: DosOptions) => DosReadyPromise;
const Dos: DosFactory = (canvas: HTMLCanvasElement, options?: DosOptions) => {
    const promise = new Promise<DosRuntime>((resolve, reject) => {
        const module = new DosModule(canvas, resolve);

        if (!options) {
            options = {};
        }

        if (!options.onerror) {
            options.onerror = (message: string) => {
                /* tslint:disable:no-console */
                console.error(message);
                /* tslint:enable:no-console */
            };
        }

        Object.assign(module, options);


```







### Error handling
Error handling should support both ways:

* Through rejecting of promise
* Fire onerror function of DosOptions object


  

```

        const onerror = module.onerror;
        module.onerror = (message: string) => {
            reject(message);

            const fn = () => {
                if (onerror) {
                    onerror(message);
                    module.onerror = onerror;
                } else {
                    module.onerror = module.error;
                }
            };

            setTimeout(fn, 1);
        };

        module.resolve();
        if (!module.isValid) {
            return;
        }

        openCache(module, (cache) => {

```







See [Host](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-host)
to understand resolving of emulation layer (dosbox).


  

```
            Host.resolveDosBox(module.wdosboxUrl as string, cache, module);
        });

    });


```







### DosReadyPromise
Is a Promise object with additional method ready.
Method `ready` is just a wrapper over `then` method that
split resolved object into meaningful parts.


  

```

    const dosReadyPromise = (promise as unknown) as DosReadyPromise;
    dosReadyPromise.ready = (onready) => {
        dosReadyPromise.then((runtime: DosRuntime) => {
            onready(runtime.fs, runtime.main);
        });
        return dosReadyPromise;
    };
    return dosReadyPromise;
};

export default Dos;

export type DosMainFn = (args?: string[]) => Promise<DosCommandInterface>;


```







Plain promise will be resolved with `DosRuntime` interface, that
includes:

* `fs`: [DosFS](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-fs) -
API for working with dosbox filesystem
* `main`: DosMainFn - a function that you should call to actuall start
dosbox. It's like a main function in C++, or shell command line. This function
will return Promise of [DosCommandInterface](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-ci).
You can use it to control runned dosbox.


  

```
export interface DosRuntime {
    fs: DosFS;
    main: DosMainFn;
}

export interface DosReadyPromise extends Promise<DosRuntime> {

```







`onready` - callback that receive DosRuntime splitted by fields


  

```
    ready: (onready: (fs: DosFS, main: DosMainFn) => void) => Promise<DosRuntime>;
}

(window as any).Dos = Dos;
(window as any).DosController = {
    Qwerty,
    Move,
};


```




