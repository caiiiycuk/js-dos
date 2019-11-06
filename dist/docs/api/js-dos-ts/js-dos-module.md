



# DosModule
DosModule is [emscripten module object](https://kripken.github.io/emscripten-site/docs/api_reference/module.html),
with additional functionality


  

```
import Dos, { DosRuntime } from "./js-dos";
import { Build } from "./js-dos-build";
import { DosCommandInterface } from "./js-dos-ci";
import getJsDosConfig from "./js-dos-conf";
import { DosFS } from "./js-dos-fs";
import { DosOptions } from "./js-dos-options";
import { DosUi } from "./js-dos-ui";

export class DosModule extends DosOptions {
    public isValid: boolean = false;
    public canvas: HTMLCanvasElement;
    public version = Build.version;
    public onglobals?: (...args: any[]) => void;
    public ci: Promise<DosCommandInterface>;

    private instance: any;
    private fs: DosFS | null = null;
    private ui: DosUi | null = null;
    private onready: (runtime: DosRuntime) => void;

    private tickListeners: Array< () => void > = [];
    private pauseListeners: Array< () => void > = [];
    private resumeListeners: Array< () => void > = [];
    private terminateListeners: Array< () => void > = [];

    private ciResolveFn: (ci: DosCommandInterface) => void = () => {};

    constructor(canvas: HTMLCanvasElement, onready: (runtime: DosRuntime) => void) {
        super();
        this.canvas = canvas;
        this.onready = onready;
        this.ci = new Promise<DosCommandInterface>((resolve) => {
            this.ciResolveFn = resolve;
        });

        this.registerDefaultListeners();
    }

    private registerDefaultListeners() {
        let hidden: string;
        let visibilityChange: string;

        if (typeof document.hidden !== "undefined") {
            hidden = "hidden";
            visibilityChange = "visibilitychange";
        } else if (typeof (document as any).mozHidden !== "undefined") {
            hidden = "mozHidden";
            visibilityChange = "mozvisibilitychange";
        } else if (typeof (document as any).msHidden !== "undefined") {
            hidden = "msHidden";
            visibilityChange = "msvisibilitychange";
        } else if (typeof (document as any).webkitHidden !== "undefined") {
            hidden = "webkitHidden";
            visibilityChange = "webkitvisibilitychange";
        }

        document.addEventListener("visibilityChange", () => {
            (document as any)[hidden] ? this.pause() : this.resume();
        }, false);

        window.addEventListener("beforeunload", () => {
           this.terminate();
        });
    }


```







### logging
DosModule implements simply logging features:
`debug`, `info`, `warn`, `error` methods


  

```
    public debug(message: string) {
        if (this.log !== undefined) {
            this.log("[DEBUG] " + message);
        }
    }

    public info(message: string) {
        if (this.log !== undefined) {
            this.log("[INFO] " + message);
        }
    }

    public warn(message: string) {
        if (this.log !== undefined) {
            this.log("[WARN] " + message);
        }
    }

    public error(message: string) {
        if (this.log !== undefined) {
            this.log("[ERROR] " + message);
        }
    }


```







### ondosbox


  

```
    public ondosbox(dosbox: any, instantiateWasm: any) {
        this.info("DosBox resolved");
        (this as any).instantiateWasm = instantiateWasm;
        this.instance = new dosbox(this);
    }


```







Method `ondosbox` is called when
[Host](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-host) is resolved.
This method instaniate wasm dosbox module with `this` as emscripten
module object. It means that emscripten will call
`this.onRuntimeInitialized` when runtime will be ready


  

```

    public resolve() {
        if (!this.wdosboxUrl) {
            this.wdosboxUrl = "wdosbox.js";
        }

        if (!this.log) {
            /* tslint:disable:no-console */
            this.log = (message: string) => console.log(message);
        }

        if (!this.canvas) {
            if (this.onerror !== undefined) {
                this.onerror("canvas field is required, but not set!");
            }
            return;
        }

        if (!this.onprogress) {
            this.ui = new DosUi(this);
            this.onprogress = (stage, total, loaded) => {
                if (this.ui !== null) {
                    this.ui.onprogress(stage, total, loaded);
                }
            };
        }


```







### sdl defaults
DosModule overrides defaults for emscripten SDL wrapper
for maximum performance


  

```
        (this as any).SDL = {
            defaults: {
                widht: 320,
                height: 200,
                copyOnLock: false,
                discardOnLock: true,
                opaqueFrontBuffer: false,
            },
        };

        this.isValid = true;
    }


```







### onRuntimeInitialized


  

```
    public onRuntimeInitialized() {
        const mainFn = (args?: string[]) => {

```







When emscripten runtime is initialized and main
function is called:

* DosModule detach [auto ui](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-ui)


  

```
            if (this.ui !== null) {
                this.ui.detach();
                this.ui = null;
            }

            if (!args) {
                args = [];
            }

            if (this.fs === null) {
                return new Promise<DosCommandInterface>((resolve, reject) => {
                    reject("IllegalState: fs is null");
                });
            }

            this.fs.chdir("/");


```







* Write default [dosbox.conf](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-conf)
file to user directory


  

```
            this.fs.createFile("/home/web_user/.dosbox/dosbox-jsdos.conf", getJsDosConfig(this));

```







* Mount emscripten FS as drive c:


  

```
            args.unshift("-userconf", "-c", "mount c .", "-c", "c:");

```







[DosCommandInterface](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-ci)


  

```
            new DosCommandInterface(this, (ci: DosCommandInterface) => {
                this.ciResolveFn(ci);
            });

```







* Run dosbox with passed arguments and resolve


  

```
            (this as any).callMain(args);
            return this.ci;
        };
        this.fs = new DosFS(this);
        this.onready({
            fs: this.fs,
            main: mainFn,
        });
    }


```







### registerTickListener
registred tick listener it will be called each frame


  

```
    public registerTickListener(listener: () => void) {
        this.tickListeners.push(listener);
    }


```







### registerPauseListener
registred tick listener it will be called each frame


  

```
    public registerPauseListener(listener: () => void) {
        this.pauseListeners.push(listener);
    }


```







### registerResumeListener
registred tick listener it will be called each frame


  

```
    public registerResumeListener(listener: () => void) {
        this.resumeListeners.push(listener);
    }


```







### registerTerminateListener
registred tick listener it will be called each frame


  

```
    public registerTerminateListener(listener: () => void) {
        this.terminateListeners.push(listener);
    }


```







### tick
tick is called internally each frame, no need to call
it manually


  

```
    public tick() {
        for (const l of this.tickListeners) {
            l();
        }
    }


```







### pause
pause is called when dosbox tab became inactive


  

```
    public pause() {
        for (const l of this.pauseListeners) {
            l();
        }
    }


```







### tick
resume is called when dosbox tab became active


  

```
    public resume() {
        for (const l of this.resumeListeners) {
            l();
        }
    }


```







### tick
terminate is called when dosbox tab is closed


  

```
    public terminate() {
        for (const l of this.terminateListeners) {
            l();
        }
    }

}


```




