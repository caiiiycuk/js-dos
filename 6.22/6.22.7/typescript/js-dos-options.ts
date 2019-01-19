import { DosCommandInteface } from "./js-dos-ci";
import { DosFS } from "./js-dos-fs";

// DosOptions
// ----------
// Is a options object that you pass to constructor of [Dos](js-dos.html)
// class, to configure emulation layer:
export class DosOptions {

    // onprogress
    // ----------
    // this function is called while js-dos is loading
    public onprogress?: (stage: string, total: number, loaded: number) => void;

    // onerror
    // -------
    // this function is called when error happens
    public onerror?: (message: string) => void;

    // log
    // ---
    //  you can provide log function, to override logging, by default js-dos uses console.log as implementation
    public log?: (message: string) => void;

    // wdosboxUrl
    // ----------
    // you can set alternative url for downloading js-dos script, default is 'wdosbox.js'
    public wdosboxUrl?: string;

}
