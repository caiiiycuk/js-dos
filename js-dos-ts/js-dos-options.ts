// # DosOptions
// Is a options object that you pass to constructor of
// [Dos](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos)
// class, to configure emulation layer
import { DosCommandInterface } from "./js-dos-ci";
import { DosFS } from "./js-dos-fs";

export class DosOptions {

    // ### onprogress
    public onprogress?: (stage: string, total: number, loaded: number) => void;
    // progress event listener, it is fired when loading progress is changed
    // if this function is not set, then
    // [auto ui](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-ui) will be used
    // to show progress
    //
    // * `stage` - current loading stage
    // * `total` - total bytes to download on current stage
    // * `loaded` - downloaded bytes

    // ### onerror
    public onerror?: (message: string) => void;
    // this function is called when error happens
    //
    // * `message` - infomation about error

    // ### log
    public log?: (message: string) => void;
    // you can provide log function, to override logging, by default js-dos uses console.log as implementation

    // ### wdosboxUrl
    public wdosboxUrl?: string;
    // you can set alternative url for downloading js-dos script, default is 'wdosbox.js'

}
