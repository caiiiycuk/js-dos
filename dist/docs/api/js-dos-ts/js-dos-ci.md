



# DosCommandInterface
Is abstraction that allows you to control runned instance of js-dos


  

```
import { Dos } from "./js-dos";
import { DosModule } from "./js-dos-module";
import { Xhr } from "./js-dos-xhr";

export class DosCommandInterface {
    public dos: DosModule;
    private em: typeof Module;
    private api: LowLevelApi;
    private onready: (ci: DosCommandInterface) => void;

    private shellInputQueue: string[] = [];
    private shellInputClients: Array<() => void> = [];

    constructor(dos: DosModule, onready: (ci: DosCommandInterface) => void) {
        this.dos = dos;
        this.em = (dos as any);
        this.api = (dos as any);
        this.api.ping = (msg: string, ...args: any[]) => {
            this.onping(msg, args);
        };
        this.onready = onready;
    }


```







* `width()` - return dosbox window width in pixels


  

```
    public width() {
        return this.dos.canvas.width;
    }


```







* `height()` - return dosbox window height in pixels


  

```
    public height() {
        return this.dos.canvas.height;
    }


```







* `shell([cmd1, cmd2, ...])` - executes passed commands
in dosbox shell if it's runned, returns Promise that
resolves when commands sequence is executed


  

```
    public shell(...cmd: string[]) {
        if (cmd.length === 0) {
            return;
        }

        return new Promise((resolve, reject) => {
            this.shellInputClients.push(resolve);
            for (const next of cmd) {
                this.shellInputQueue.push(next);
            }
            this.requestShellInput();
        });
    }


```







* `screenshot()` - get screnshot of canvas as ImageData


  

```
    public screenshot() {
        return new Promise((resolve) => {
            this.api.send("screenshot", "", (data) => {
                resolve(data);
            });
        });
    }


```







* `exit()` - immediately exit from runtime


  

```
    public exit() {
        try {
            this.api.send("exit");
        } catch (e) {
            return 0;
        }

        this.dos.error("Runtime is still alive!");
        return -1;
    }

    private sendKeyPress(code: number) {
        this.api.send("sdl_key_event", code + "");
    }

    private requestShellInput() {
        this.sendKeyPress(13);
    }

    private onping(msg: string, args: any[]) {
        switch (msg) {
            case "ready":
                this.onready(this);
                break;
            case "shell_input":
                if (this.shellInputQueue.length === 0) {
                    return;
                }

                const buffer: number = args[0];
                const maxLength: number = args[1];

                const cmd = this.shellInputQueue.shift();
                const cmdLength = (this.em as any).lengthBytesUTF8(cmd) + 1;

                if (cmdLength > maxLength) {
                    this.dos.onerror("Can't execute cmd '" + cmd +
                        "', because it's bigger then max cmd length " + maxLength);
                    return;
                }

                (this.em as any).stringToUTF8(cmd, buffer, cmdLength);

                if (this.shellInputQueue.length === 0) {
                    for (const resolve of this.shellInputClients) {
                        resolve();
                    }
                    this.shellInputClients = [];
                } else {
                    this.requestShellInput();
                }
            default:
            /* do nothing */
        }
    }
}

interface LowLevelApi {
    send: (event: string, msg?: any, callback?: (msg: string) => void) => void;
    ping: (msg: string) => void;
}


```




