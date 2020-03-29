// # DosOptions
// Is a options object that you pass to constructor of
// [Dos](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos)
// class, to configure emulation layer

// ### DosArchiveSource
export interface DosArchiveSource {
    // source (archive) to download and mount to dosbox filesystem

    // **url** where archive is located
    url: string;

    // **mountPoint**
    mountPoint: string;
    // is a path to mount archive contents. There are two types of mountPoints:
    //
    // * path '/' which is a MEMFS that is live only in one ssesion.
    // It means that after restart all progress will be erased.
    //
    // * any other path (e.g. '/game'). This path will be stored across sessions in indexed db. It means
    // that progress will be there after browser restart.
    //
    // In other words, you can use path '/' to store temporal data, but others use to store
    // content that need to be persisten.
    //
    // **NOTE**: because content of folder is stored in indexed db original archive is downloaded
    // and extracted only once to avoid rewriting stored content! And you can't store different
    // content (from different archives) into one path.

    // **type** currently we support only zip archives
    type?: "zip";
}


// tslint:disable-next-line:max-classes-per-file
export interface DosOptionsBag {
    // ### element
    element?: string | HTMLElement;
    // * html element or id of element, which is used as window for dosbox

    // ### middlewareUrl
    middlewareUrl?: string;
    // you can set alternative url for downloading middleware module, each module have it's default

    // ### cycles
    cycles?: number | string;
    //    Amount of instructions DOSBox tries to emulate each millisecond.
    //    Setting this value too high results in sound dropouts and lags.
    //
    //    Cycles can be set in 3 ways:
    //
    //    * `auto` - tries to guess what a game needs. It usually works, but can fail for certain games.
    //    * `fixed #number` - will set a fixed amount of cycles. This is what you
    // usually need if 'auto' fails. (Example: fixed 4000).
    //    * `max` - will allocate as much cycles as your computer is able to handle.
    //

    // ### autolock
    autolock?: boolean;
    //    Mouse will automatically lock, if you click on the screen. (Press CTRL-F10 to unlock)
    //
    //    By default dosbox mouse will follow browser cursor without locking.
    //    It means that js-dos will not take exclusive control over mouse pointer.
    //    However you can change this behaviour by providing `autolock=true` in
    //    `dosbox.conf` or throug h [DosOptions](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-options).
    //    Then js-dos will take exclusive control and lock mouse inside js-dos container (you can't leave it).
    //    This will happen after first click, and you can unlock mouse by pressing `CTRL+F10` or `ESC`.
    //
    // ### sources
    sources?: DosArchiveSource[];
    // list of sources to mount on dosbox filesystem, look DosArchiveSource docs

    // ### onprogress
    onprogress?: (stage: string, total: number, loaded: number) => void;
    // progress event listener, it is fired when loading progress is changed
    // if this function is not set, then
    // [auto ui](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-ui) will be used
    // to show progress
    //
    // * `stage` - current loading stage
    // * `total` - total bytes to download on current stage
    // * `loaded` - downloaded bytes

    // ### log
    log?: (message: string) => void;
    // you can provide log function, to override logging, by default js-dos uses console.log as implementation

}

export interface DosConfig {
    element: HTMLElement;
    jsdosUrl: string;
    cycles: number | string;
    autolock: boolean;
    sources: DosArchiveSource[];
    onprogress: (stage: string, total: number, loaded: number) => void;
    log: (message: string) => void;
}
