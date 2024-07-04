import { CommandInterface } from "emulators";

export function lifecycle(ci: CommandInterface) {
    let hidden = "";
    let visibilityChange = "";

    if (typeof document.hidden !== "undefined") {
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof (document as any).mozHidden !== "undefined") {
        hidden = "mozHidden";
        visibilityChange = "mozvisibilitychange";
    } else if (typeof (document as any).msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof (document as any).webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }

    function visibilitHandler() {
        (document as any)[hidden] ? ci.pause() : ci.resume();
    }

    document.addEventListener(visibilityChange as any, visibilitHandler);
    ci.events().onExit(() => {
        document.removeEventListener(visibilityChange as any, visibilitHandler);
    });
}
