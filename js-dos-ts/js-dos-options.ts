import { DosCommandInteface } from "./js-dos-ci";

// DosOptions
// ----------
// Is a options object that you pass to constructor of [Dos](js-dos.html)
// class, to configure emulation layer:
export class DosOptions {

    // canvas
    // ------
    // is **required** field, you should set existing HTMLCanvasElement, it will be used for render dos screen
    public canvas: HTMLCanvasElement;

    // onready
    // -------
    // This function is called before run entry point of dosbox
    // with it you can change command line arguments that
    // passed to dosbox
    public onready?: (main: (args: string[]) => void) => void;

    // onprogress
    // ----------
    // this function is called while js-dos is loading
    public onprogress?: (total: number, loaded: number) => void;

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
