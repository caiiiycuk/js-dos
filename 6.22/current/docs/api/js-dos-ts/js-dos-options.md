



# DosOptions
Is a options object that you pass to constructor of
[Dos](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos)
class, to configure emulation layer


  

```

export class DosBoxConfig {
    public cycles?: number | string;

```







   cycles: Amount of instructions DOSBox tries to emulate each millisecond.
           Setting this value too high results in sound dropouts and lags.

           Cycles can be set in 3 ways:

             'auto'          tries to guess what a game needs.
                             It usually works, but can fail for certain games.

             'fixed #number' will set a fixed amount of cycles. This is what you usually need if 'auto' fails.
                             (Example: fixed 4000).

             'max'           will allocate as much cycles as your computer is able to handle.



  

```
    public autolock?: boolean;

```







   autolock: Mouse will automatically lock, if you click on the screen. (Press CTRL-F10 to unlock)

   By default dosbox mouse will follow browser cursor without locking.
   It means that js-dos will not take exclusive control over mouse pointer.
   However you can change this behaviour by providing `autolock=true` in
   `dosbox.conf` or throug h [DosOptions](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-options).
   Then js-dos will take exclusive control and lock mouse inside js-dos container (you can't leave it).
   This will happen after first click, and you can unlock mouse by pressing `CTRL+F10` or `ESC`.



  

```
}


```







tslint:disable-next-line:max-classes-per-file


  

```
export class DosOptions extends DosBoxConfig {


```







### onprogress


  

```
    public onprogress?: (stage: string, total: number, loaded: number) => void;

```







progress event listener, it is fired when loading progress is changed
if this function is not set, then
[auto ui](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-ui) will be used
to show progress

* `stage` - current loading stage
* `total` - total bytes to download on current stage
* `loaded` - downloaded bytes








### onerror


  

```
    public onerror?: (message: string) => void;

```







this function is called when error happens

* `message` - infomation about error








### log


  

```
    public log?: (message: string) => void;

```







you can provide log function, to override logging, by default js-dos uses console.log as implementation








### wdosboxUrl


  

```
    public wdosboxUrl?: string;

```







you can set alternative url for downloading js-dos script, default is 'wdosbox.js'


  

```

}

export const DosBoxConfigDefaults: DosBoxConfig = {
    cycles: "auto",
    autolock: false,
};


```




