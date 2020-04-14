// # DosOptions
// Is a options object that you pass to constructor of
// [Dos](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos)
// class, to configure emulation layer

import { DosBundle } from "../jsdos-bundle/jsdos-bundle";

// ### DosArchiveSource
export interface JsDosArchiveSource {
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
export interface JsDosOptionsBag {
    // ### element
    element?: string | HTMLElement;
    // html element or id of element, which is used as window for dosbox

    // ### bundle
    bundle?: DosBundle | string;
    // configured bundle to use, or url

    // ### middlewareUrl
    middlewareUrl?: string;
    // you can set alternative url for downloading middleware module, each module have it's default

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

export interface JsDosOptions {
    element: HTMLElement;
    bundle: DosBundle | string;
    middlewareUrl: string;
    onprogress: (stage: string, total: number, loaded: number) => void;
    log: (message: string) => void;
}
