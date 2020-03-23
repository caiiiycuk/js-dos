import { DosKeyEventConsumer } from "../js-dos-ci";

interface IPos {
    x: number;
    y: number;
}

export interface MoveOptions {
    keysCode: {[index: string]: number};
}

const defaultOptions: MoveOptions = {
    keysCode: {
        left: 37,
        right: 39,
        up: 38,
        down: 40,
    },
};

export default function Move(zone: HTMLDivElement, consumer: DosKeyEventConsumer,
                             options: MoveOptions = defaultOptions) {
    const moveTreshold = 15;
    const keysCode: {[index: string]: number} = options.keysCode;

    const keysState: {[index: string]: string} = {
        left: "up",
        right: "up",
        up: "up",
        down: "up",
    };

    const updateKeyState = (direction: string, state: string) => {
        if (keysState[direction] === state) {
            return;
        }

        keysState[direction] = state;
        for (const next of Object.keys(keysState)) {
            if (next !== direction && keysState[next] === "down") {
                keysState[next] = "up";
                consumer.onRelease(keysCode[next]);
            }
        }

        if (state === "down") {
            consumer.onPress(keysCode[direction]);
        }
    };

    const touchInfo: {[finger: number]: IPos} = {};
    const onTouchStart = (finger: number, x: number, y: number) => {
        // console.log("start", finger, x, y);
        touchInfo[finger] = {x, y};
    };

    const onTouchMove = (finger: number, x: number, y: number) => {
        if (touchInfo[finger] === undefined) {
            return;
        }

        const dx = touchInfo[finger].x - x;
        const dy = touchInfo[finger].y - y;

        if (Math.abs(dx) < moveTreshold && Math.abs(dy) < moveTreshold) {
            return;
        }

        let direction;
        if (Math.abs(dx) >= Math.abs(dy)) {
            dx < 0 ? direction = "right" : direction = "left";
        } else {
            dy < 0 ? direction = "down" : direction = "up";
        }

        touchInfo[finger].x = x;
        touchInfo[finger].y = y;

        updateKeyState(direction, "down");
        delete touchInfo[finger];
    };

    const onTouchEnd = (finger: number, x: number, y: number) => {
        onTouchMove(finger, x, y);
        delete touchInfo[finger];
    };

    zone.addEventListener("touchstart", (event) => {
        event.preventDefault();
        const touches = event.changedTouches;
        // tslint:disable-next-line:prefer-for-of
        for (let touchIndex = 0; touchIndex < touches.length; touchIndex++) {
            const main = touches[touchIndex];
            onTouchStart(main.identifier, main.pageX, main.pageY);
        }
    }, true);

    zone.addEventListener("touchmove", (event) => {
        event.preventDefault();
        const touches = event.changedTouches;
        // tslint:disable-next-line:prefer-for-of
        for (let touchIndex = 0; touchIndex < touches.length; touchIndex++) {
            const main = touches[touchIndex];
            onTouchMove(main.identifier, main.pageX, main.pageY);
        }
    }, true);

    zone.addEventListener("touchend", (event) => {
        event.preventDefault();
        const touches = event.changedTouches;
        // tslint:disable-next-line:prefer-for-of
        for (let touchIndex = 0; touchIndex < touches.length; touchIndex++) {
            const main = touches[touchIndex];
            onTouchEnd(main.identifier, main.pageX, main.pageY);
        }
    }, true);

    zone.addEventListener("mousedown", (event) => {
        event.preventDefault();
        onTouchStart(-1, event.pageX, event.pageY);
    }, true);

    zone.addEventListener("mousemove", (event) => {
        event.preventDefault();
        onTouchMove(-1, event.pageX, event.pageY);
    }, true);

    zone.addEventListener("mouseup", (event) => {
        event.preventDefault();
        onTouchEnd(-1, event.pageX, event.pageY);
    }, true);

    zone.addEventListener("mouseleave", (event) => {
        event.preventDefault();
        onTouchEnd(-1, event.pageX, event.pageY);
    }, true);

}
