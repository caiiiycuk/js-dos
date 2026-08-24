export type DosEvent = "emu-ready" | "ci-ready" | "bnd-play" | "open-key" | "fullscreen-change";
export type ImageRendering = "pixelated" | "smooth";
export type RenderBackend = "webgl" | "canvas";
export type RenderAspect = "AsIs" | "1/1" | "5/4" | "4/3" | "16/10" | "16/9" | "Fit";
export type SockdrivePreload = "none" | "all" | "default";

export interface IceServer {
    urls: string | string[];
    username?: string;
    credential?: string;
}

export type InitBundleEntry = Uint8Array;
export interface InitFileEntry {
    path: string;
    contents: Uint8Array;
}
export type InitFsEntry = InitBundleEntry | InitFileEntry;
export type InitFs = InitFsEntry | InitFsEntry[];

export type NetInstance = {
    peerId: number;
    connected: Set<number>;
    wait: (ms: number) => void;
    registerAlias: (alias: string) => Promise<void>;
    unregisterAlias: (alias: string) => void;
    queryAliases: (query: string) => Promise<{
        peerId: number;
    }[]>;
    sendBinary: (data: Uint8Array, peerId: number) => number;
    recvBinary: () => { data: Uint8Array, peerId: number } | null;
    disconnect: (peerId: number) => void;
    shutdown: () => void;
}

export interface DosOptions {
    url: string,
    dosboxConf: string,
    jsdosConf: any,
    initFs: InitFs,
    background: string,
    pathPrefix: string,
    pathSuffix: string,
    opfsRoot: string,
    theme: "light" | "dark" | "cupcake" | "bumblebee" | "emerald" | "corporate" |
    "synthwave" | "retro" | "cyberpunk" | "valentine" | "halloween" | "garden" |
    "forest" | "aqua" | "lofi" | "pastel" | "fantasy" | "wireframe" | "black" |
    "luxury" | "dracula" | "cmyk" | "autumn" | "business" | "acid" | "lemonade" |
    "night" | "coffee" | "winter",
    lang: "ru" | "en",
    backend: "dosbox" | "dosboxX",
    backendLocked: boolean,
    backendHardware: ((backend: "dosbox" | "dosboxX") => Promise<string | null>),
    workerThread: boolean,
    offscreenCanvas: boolean,
    mouseCapture: boolean,
    onEvent: (event: DosEvent, arg?: any /* CommandInterface | boolean */) => void,
    fullScreen: boolean,
    autoStart: boolean,
    fastForwardOnBoot: number,
    countDownStart: number,
    autoSave: boolean,
    kiosk: boolean,
    imageRendering: ImageRendering,
    renderBackend: RenderBackend,
    renderAspect: RenderAspect,
    scaleControls: number,
    mouseSensitivity: number,
    noCursor: boolean,
    softKeyboardLayout: string[] | string[][][],
    softKeyboardSymbols: { [key: string]: string }[],
    volume: number,
    softFullscreen: boolean,
    thinSidebar: boolean,
    sockdrivePreload: SockdrivePreload,
    startIpxServer: boolean,
    connectIpxAddress: string,
    fsChanges: {
        local: boolean,
        urlToKey?: (url: string) => Promise<string>,
        pull?: (key: string) => Promise<Uint8Array | null>;
        push?: (key: string, data: Uint8Array) => Promise<void>;
        delete?: (key: string) => Promise<void>;
    },
    net: {
        peerServer: string,
        token: string,
        secret: string,
        iceServers: () => Promise<IceServer[]>,
    },
    sharedNet: NetInstance,
}

export interface DosProps {
    getVersion(): [string, string];
    getLocalChanges(key: string): Promise<Uint8Array | null>;

    setTheme(theme: DosOptions["theme"]): void;
    setLang(lang: DosOptions["lang"]): void;
    setBackend(backend: DosOptions["backend"]): void;
    setBackendLocked(locked: boolean): void;
    setWorkerThread(capture: DosOptions["workerThread"]): void;
    setOffscreenCanvas(offscreenCanvas: DosOptions["offscreenCanvas"]): void;
    setMouseCapture(capture: DosOptions["mouseCapture"]): void;
    setBackground(background: string | null): void;
    setFullScreen(fullScreen: boolean): void;
    setAutoStart(autoStart: boolean): void;
    setCountDownStart(countDownStart: number): void;
    setAutoSave(autoSave: boolean): void;
    setKiosk(kiosk: boolean): void;
    setImageRendering(rendering: ImageRendering): void;
    setRenderBackend(backend: RenderBackend): void;
    setRenderAspect(aspect: RenderAspect): void;
    setNoCloud(noCloud: boolean): void;
    setPaused(pause: boolean): void;
    setScaleControls(scaleControls: number): void;
    setMouseSensitivity(mouseSensitivity: number): void;
    setNoCursor(noCursor: boolean): void;
    setSoftKeyboardLayout(layout: string[] | string[][][]): void;
    setSoftKeyboardSymbols(symbols: { [key: string]: string }[]): void;
    setVolume(volume: number): void;
    setSoftFullscreen(softFullscreen: boolean): void;
    setThinSidebar(thinSidebar: boolean): void;
    save(): Promise<boolean>;
    stop(): Promise<void>;
}

export type DosFn = (element: HTMLDivElement, options: Partial<DosOptions>) => DosProps;

// declare const Dos: DosFn;
