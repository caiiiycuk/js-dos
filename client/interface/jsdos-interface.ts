export interface BuildInfo {
    version: string;
    buildSeed: number;
}

export interface WasmModule {
    instantiate: (module?: any) => Promise<any>;
}

export interface XhrOptions {
    cache: Cache;
    method?: string;
    progress?: (total: number, loaded: number) => void;
    data?: string;
    responseType?: XMLHttpRequestResponseType;
}
// * `method` - "GET" | "POST"
// * `progress` - callback for progress
// * `data` - data for POST request, should typeof `application/x-www-form-urlencoded`
// * `responseType` - XMLHttpRequestResponseType

export type ProgressFn = (stage: string, total: number, loaded: number) => void;
export type ResourceFactory = (url: string, options: XhrOptions) => Promise<string | ArrayBuffer>;
export type WasmModuleFactory = (url: string,
                                 moduleName: string,
                                 onprogress: ProgressFn) => Promise<WasmModule>;

export interface DosClient {
    config: JsDosConfig;
    cache: Cache;
    createResource: ResourceFactory;
    createWasmModule: WasmModuleFactory;
}

export interface DosMiddleware {
    buildInfo: BuildInfo;
    run: (client: DosClient) => Promise<DosCommandInterface>;
};


// # DosCommandInterface
// Is abstraction that allows you to control runned instance of jsdos

export interface DosKeyEventConsumer {
    onPress(keyCode: number): void;
    onRelease(keyCode: number): void;
}

export interface DosCommandInterface {
    // * `fullscreen()` - enters fullscreen mode
    // This function can be called anywhere, but for web security reasons its associated request can only be raised
    // inside the event handler for a user-generated event (for example a key, mouse or touch press/release).
    fullscreen: () => void;

    // * `exitFullscreen()` allows you to leave fullscreen entered with `fullscreen()` call
    exitFullscreen: () => void;

    // * `listenStdout()` - redirect everything that printed by dosbox into
    // console to passed function
    listenStdout: (onstdout: (data: string) => void) => void;

    // * `shell([cmd1, cmd2, ...])` - executes passed commands
    // in dosbox shell if it's runned, returns Promise that
    // resolves when commands sequence is executed
    shell: (...cmd: string[]) => void;

    // * `screenshot()` - get screnshot of canvas as ImageData 
    screenshot: () => Promise<ImageData>;

    // * `exit()` - exit from runtime
    exit: () => Promise<void>;

    // * `simulateKeyPress(keyCode)` - allows to simulate key press **AND** release event for key code
    // see `sendKeyPress` to find meaning of keyCode
    simulateKeyPress: (keyCode: number) => void;

    // will store all changes made in FS, if persistencyKey is set
    persist(): Promise<void>;
}


export interface JsDosConfig {
    buildInfo: BuildInfo;

    element: HTMLElement;
    pathPrefix: string;
    bundleUrl: string;

    persistencyKey: string;

    onprogress: (stage: string, total: number, loaded: number) => void;

    log: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    err: (...args: any[]) => void;
}

// ### Cache
export interface Cache {
    put: (key: string, data: string | ArrayBuffer) => Promise<void>;
    get: (key: string, defaultValue?: string | ArrayBuffer) => Promise<string | ArrayBuffer>;
    forEach: (each: (key: string, value: any) => void, onend: () => void) => void;
    close: () => void;
}
