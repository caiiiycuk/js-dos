import { DosCommandInterface } from "../js-dos-ci";

export interface GamepadConfig {
    buttons: string[];
    keymap: {[button: string]: number};
    mapArrows: boolean;
    stickThreshold: number;
}

export interface GamepadOptions {
    gamepads: GamepadConfig[];
    scanEvery: number;
    scanOnTick: boolean;
}

export default function Gamepad(
    ci: DosCommandInterface,
    options: GamepadOptions) {
    const xBox360Buttons: string[] = [
        "a", "b", "x", "y", 				// 0, 1, 2, 3
        "lb", "rb", "lt", "rt", 			// 4, 5, 6, 7
        "back", "start", "N/A", "N/A", 		// 8, 9, 10, 11
        "up", "down", "left", "right",  		// 12, 13, 14, 15
    ];

    const arrows: {[button: string]: number} = {
        left: 37,
        right: 39,
        up: 38,
        down: 40,

        lsleft: 37,
        lsright: 39,
        lsup: 38,
        lsdown: 40,

        rsleft: 37,
        rsright: 39,
        rsup: 38,
        rsdown: 40,
    };

    const consumer = ci.getKeyEventConsumer();
    const detected: number[] = [];
    const lastStates: {[index: number]: number[]} = {};

    function pushPressed(
        button: string,
        config: GamepadConfig,
        pressed: number[]) {

        const keymap = config.keymap || {};
        let key = config.keymap[button];

        if (!key && config.mapArrows) {
            key = arrows[button];
        }

        if (key && (pressed.indexOf(key) === -1)) {
            pressed.push(key);
        }
    }

    function getPressed(gp: any, config: GamepadConfig) {
        const buttons = config.buttons || xBox360Buttons;
        const pressed: number[] = [];

        for (let i = 0; i < buttons.length; i++) {
            if (gp.buttons[i] && gp.buttons[i].pressed) {

                pushPressed(buttons[i], config, pressed);
            }
        }

        mapStickToKeys(
            gp.axes[0],
            gp.axes[1],
            "ls",
            config,
            pressed);

        mapStickToKeys(
            gp.axes[2],
            gp.axes[3],
            "rs",
            config,
            pressed);

        return pressed;
    }

    function mapStickToKeys(
        x: number,
        y: number,
        stick: string,
        config: GamepadConfig,
        pressed: number[]) {

        const threshold = config.stickThreshold;

        if (!threshold) {
            return;
        }

        if (x > threshold) {
            pushPressed(stick + "right", config, pressed);
        }

        if (x < -threshold) {
            pushPressed(stick + "left", config, pressed);
        }

        if (y > threshold) {
            pushPressed(stick + "down", config, pressed);
        }

        if (y < -threshold) {
            pushPressed(stick + "up", config, pressed);
        }
    }

    function getActions(newState: number[], lastState: number[]) {
        const release: number[] = [];
        const press: number[] = [];
        lastState = lastState || [];

        // tslint:disable-next-line
        for (let i = 0; i < lastState.length; i++) {
            if (newState.indexOf(lastState[i]) === -1) {
                release.push(lastState[i]);
            }
        }

        // tslint:disable-next-line
        for (let i = 0; i < newState.length; i++) {
            if (lastState.indexOf(newState[i]) === -1) {
                press.push(newState[i]);
            }
        }

        return {
            press,
            release,
        };
    }

    function getGamepadConfiguration(gpi: number) {
        let mapIndex = detected.indexOf(gpi);
        if (mapIndex === -1) {
            mapIndex = detected.length;
            detected.push(gpi);
        }

        mapIndex = Math.min(mapIndex, options.gamepads.length - 1);
        return options.gamepads[mapIndex];
    }

    function scan() {
        const gps = navigator.getGamepads();

        for (let i = 0; i < gps.length; i++) {

            const gp = gps[i];

            if (gp && gp.connected) {

                const config = getGamepadConfiguration(i);
                const pressed = getPressed(gp, config);
                const actions = getActions(pressed, lastStates[i]);

                // tslint:disable-next-line
                for (let j = 0; j < actions.press.length; j++) {
                    consumer.onPress(actions.press[j]);
                }

                // tslint:disable-next-line
                for (let j = 0; j < actions.release.length; j++) {
                    consumer.onRelease(actions.release[j]);
                }

                lastStates[i] = pressed;
            }
        }
    }

    if (options.scanEvery) {
        // when game is paused tick listener
        // does not fire, so we need a workaround
        // so we can resume!
        setInterval(scan, options.scanEvery);
    }

    if (options.scanOnTick) {
        const dos = ci.dos;
        dos.registerTickListener(scan);
    }
}
