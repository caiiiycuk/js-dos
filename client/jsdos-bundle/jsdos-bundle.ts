// # DosBundle
// Is a complete bundle that contains everything needed to start dosbox server

import { DosConfig, createDosConfig } from "./jsdos-conf";

export interface DosOptionsBag {
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
}

export interface DosBundle {
    cycles: number |string;
    autolock: boolean;
}


