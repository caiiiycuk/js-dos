import { DosModule } from "./js-dos-module";

(window as any).exports = {};

export function resolveDosBox(url: string, module: DosModule) {
    if ((window as any).exports.WDOSBOX) {
        module.ondosbox((window as any).exports.WDOSBOX);
        return;
    }

    const request = new XMLHttpRequest();
    request.open("GET", url);
    request.onreadystatechange = () => {
        if ((request.status === 200) && (request.readyState === 4)) {
            /* tslint:disable:no-eval */
            eval.call(window, request.responseText);

            module.ondosbox((window as any).exports.WDOSBOX);
        } else if (request.readyState === 4) {
            module.onerror("Can't download wdosbox.js, code: " + request.status + ", body: " + request.responseText);
        }
    };
    request.send();
};
