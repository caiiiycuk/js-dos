



# DosOptions
Is a options object that you pass to constructor of [Dos](js-dos.html)
class, to configure emulation layer:


  

```
import { DosCommandInterface } from "./js-dos-ci";
import { DosFS } from "./js-dos-fs";

export class DosOptions {


```







`onprogress` - progress event listener, it is fired when loading progress is changed
* `stage` - current loading stage
* `total` - total bytes to download on current stage
* `loaded` - downloaded bytes


  

```
    public onprogress?: (stage: string, total: number, loaded: number) => void;


```







`onerror` - this function is called when error happens
* `message` - infomation about error


  

```
    public onerror?: (message: string) => void;


```







`log` - you can provide log function, to override logging, by default js-dos uses console.log as implementation


  

```
    public log?: (message: string) => void;


```







`wdosboxUrl` - you can set alternative url for downloading js-dos script, default is 'wdosbox.js'


  

```
    public wdosboxUrl?: string;

}


```




