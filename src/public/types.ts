export interface DosOptions {
    url: string,
    dosboxConf: string,
    background: string,
    pathPrefix: string,
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
    mouseCapture: boolean,
    onEvent: (event: "emu-ready" | "ci-ready" | "bnd-play", ci?: any) => void,
    server: "netherlands" | "newyork" | "singapore",
    room: string,
    fullScreen: boolean,
}

export interface DosProps {
    setTheme(theme: DosOptions["theme"]): void;
    setLang(lang: DosOptions["lang"]): void;
    setBackend(backend: DosOptions["backend"]): void;
    setBackendLocked(locked: boolean): void;
    setWorkerThread(capture: DosOptions["workerThread"]): void;
    setMouseCapture(capture: DosOptions["mouseCapture"]): void;
    setServer(server: DosOptions["server"]): void;
    setRoom(room: DosOptions["room"]): void;
    setFrame(frame: "network"): void;
    setBackground(background: string | null): void;
    setFullScreen(fullScreen: boolean): void;
}

export type DosFn = (element: HTMLDivElement, options: Partial<DosOptions>) => DosProps;

// declare const Dos: DosFn;
