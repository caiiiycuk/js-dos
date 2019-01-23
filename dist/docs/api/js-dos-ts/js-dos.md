











# Dos
Dos function is entry point that provides emulation layer.
As emulation layer js-dos uses [DosBox ported to emscripten](https://github.com/dreamlayers/em-dosbox/#compiling).
Example of usage:
```javascript
Dos(canvas).ready((fs, main) => {
    fs.extract("digger.zip").then(() => {
        main(["-c", "DIGGER.COM"])
    });
});
```


  

```

import { DosCommandInterface } from "./js-dos-ci";
import { DosFS } from "./js-dos-fs";
import { Host } from "./js-dos-host";
import { DosModule } from "./js-dos-module";
import { DosOptions } from "./js-dos-options";


```







When you call Dos(canvas, options) js-dos behind the scene will download
dosbox and prepare it to start. This function will return `Promise<DosReadyPromise>`
that will be resolved when dosbox is ready. In case of error promise
will be rejected.

* `canvas`: HTMLCanvasElement - this canvas element is used as window for dosbox
* `options`: [DosOptions](js-dos-options.html) - optional configuration object



  

```
export function Dos(canvas: HTMLCanvasElement, options?: DosOptions) {
    const promise = new Promise<DosRuntime>((resolve, reject) => {
        const module = new DosModule(canvas, resolve);
        Object.assign(module, options);


```







Error propagation should support both ways:
1. Through rejecting of promise
2. Fire onerror function of DosOptions object


  

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


```







See [Host](js-dos-host.html) to understand resolving of emulation layer (dosbox).


  

```
        Host.resolveDosBox(module.wdosboxUrl, module);
    });


```







## DosReadyPromise
Is a Promise object with additional method ready.
Method `ready` is just a wrapper over `then` method that
split resolved object into meaningful parts.


  

```

    const dosReadyPromise = (promise as unknown) as DosReadyPromise;
    dosReadyPromise.ready = (onready) => {
        dosReadyPromise.then((runtime: DosRuntime) => {
            onready(runtime.fs, runtime.main);
        });
    };
    return dosReadyPromise;
}

export type DosMainFn = (args: string[]) => Promise<DosCommandInterface>;


```







Plain promise will be resolved with `DosRuntime` interface, that
includes:
* `fs`: [DosFS](js-dos-fs.html) - API for working with dosbox filesystem
* `main`: DosMainFn - a function that you should call to actuall start
dosbox. It's like a main function in C++, or shell command line. This function
will return Promise of [DosCommandInterface](js-dos-ci.html). You can use
it to control runned dosbox.


  

```
export interface DosRuntime {
    fs: DosFS;
    main: DosMainFn;
}

export interface DosReadyPromise extends Promise<DosRuntime> {

```







`onready` - callback that receive DosRuntime splitted by fields


  

```
    ready: (onready: (fs: DosFS, main: DosMainFn) => void) => void;
}

(window as any).Dos = Dos;


```




