import { DosControlInteface } from "./js-dos-ci";

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
    // This function is very important, it is a entry point. It's called
    // when js-dos is completely ready to run emulation layer (dosbox).
    //
    // To do this you must call main function (1st argument) with arguments like you do in
    // shell.
    // ```
    //    let ci = main([])
    // ```
    //
    // main function will return [DosControlInteface](js-dos-ci.html), you can
    // use it to control emulation layer
    public onready?: (main: (args: string[]) => DosControlInteface) => void;

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
