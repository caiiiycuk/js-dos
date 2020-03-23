// # JsDosUi
// Optional ui module for js-dos.
// This ui will be applied if client did not set `onprogress` in
// [DosOptions](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-options)
import * as DosDom from "./js-dos-dom";
import { DosModule } from "./js-dos-module";

const maxStageLength = 32;
export class DosUi {
    private canvas: HTMLCanvasElement;
    private dos: DosModule;

    private overlay: HTMLDivElement | null = null;
    private loaderMessage: HTMLDivElement | null = null;
    private hidden: boolean = true;

    constructor(dos: DosModule) {
        this.dos = dos;
        this.canvas = dos.canvas;

        // ### How it works
        // This ui replace canvas element with div .dosbox-container,
        // that contains original canvas and .dosbox-overlay as children
        // You can change style of ui by editing css for this two classes

        try {
            DosDom.applyCss("js-dos-ui-css", this.css);

            if (this.canvas.parentElement !== null && this.canvas.parentElement.className !== "dosbox-container") {
                const container = DosDom.createDiv("dosbox-container");

                const parent = this.canvas.parentElement;
                parent.replaceChild(container, this.canvas);
                container.appendChild(this.canvas);

                const overlay = DosDom.createDiv("dosbox-overlay");
                container.appendChild(overlay);

                overlay.innerHTML = this.overlayHtml;
            }

            const container = this.canvas.parentElement;
            if (container === null) {
                throw new Error("Illegal state, container is null");
            }
            this.overlay = this.childById(container, "dosbox-overlay");
            if (this.overlay === null) {
                throw new Error("Illegal state, overlay is null");
            }
            this.loaderMessage = this.childById(this.overlay, "dosbox-loader-message");

            this.hidden = true;
            this.show();
        } catch (e) {
            this.onprogress = this.onprogressFallback;
        }
    }

    public onprogress(stage: string, total: number, loaded: number) {
        if (stage.length > maxStageLength) {
            stage = "…" + stage.substr(-maxStageLength);
        }

        const message = stage + " " + Math.round(loaded * 100 / total * 10) / 10 + "%";
        if (this.loaderMessage !== null) {
            this.loaderMessage.innerHTML = message;
        }
        this.dos.info(message);

        if (loaded >= total) {
            this.hide();
        } else {
            this.show();
        }
    }

    public detach() {
        this.hide();
        this.onprogress = this.onprogressFallback;
    }

    public hide() {
        if (this.hidden) {
            return;
        }
        this.hidden = true;
        if (this.overlay !== null) {
            this.overlay.setAttribute("style", "display: none");
        }
    }

    public show() {
        if (!this.hidden) {
            return;
        }
        this.hidden = false;
        if (this.overlay !== null) {
            this.overlay.setAttribute("style", "display: block");
        }
    }

    private onprogressFallback(stage: string, total: number, loaded: number) {
        this.dos.info(stage + " " + loaded * 100 / total + "%");
    }

    private childById(parent: Element, className: string): HTMLDivElement | null {
        if (parent === null) {
            return null;
        }

        for (let i = 0; i < parent.childElementCount; ++i) {
            let child: HTMLElement | null = parent.children[i] as HTMLElement;
            if (child.className === className) {
                return child as HTMLDivElement;
            }

            child = this.childById(child, className);
            if (child !== null) {
                return child as HTMLDivElement;
            }
        }

        return null;
    }

    // ### Style
    /* tslint:disable:member-ordering */
    /* tslint:disable:max-line-length */
    private css: string = `
    .dosbox-container { position: relative; min-width: 320px; min-height: 200px; display: flex; flex-direction: column; justify-content: center; align-items: center; }
    .dosbox-overlay, .dosbox-loader { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background-color: rgba(51, 51, 51, 0.7); }
    .dosbox-start { text-align: center; position: absolute; left: 0; right: 0; bottom: 50%; color: #fff; font-size: 1.5em; text-decoration: underline; cursor: pointer; }
    .dosbox-overlay a { color: #fff; }
    .dosbox-powered { position: absolute; right: 1em; bottom: 1em; font-size: 0.8em; color: #9C9C9C; }
    .dosbox-loader-message { text-align: center; position: absolute; left: 0; right: 0; bottom: 50%; margin: 0 0 -3em 0; box-sizing: border-box; color: #fff; font-size: 1.5em; }
    @-moz-keyframes loading { 0% { left: 0; } 50% { left: 8.33333em; } 100% { left: 0; } } @-webkit-keyframes loading { 0% { left: 0; } 50% { left: 8.33333em; } 100% { left: 0; } } @keyframes loading { 0% { left: 0; } 50% { left: 8.33333em; } 100% { left: 0; } } .st-loader { width: 10em; height: 2.5em; position: absolute; top: 50%; left: 50%; margin: -1.25em 0 0 -5em; box-sizing: border-box; }
    .st-loader:before, .st-loader:after { content: ""; display: block; position: absolute; top: 0; bottom: 0; width: 1.25em; box-sizing: border-box; border: 0.25em solid #fff; }
    .st-loader:before { left: -0.76923em; border-right: 0; }
    .st-loader:after { right: -0.76923em; border-left: 0; }
    .st-loader .equal { display: block; position: absolute; top: 50%; margin-top: -0.5em; left: 4.16667em; height: 1em; width: 1.66667em; border: 0.25em solid #fff; box-sizing: border-box; border-width: 0.25em 0; -moz-animation: loading 1.5s infinite ease-in-out; -webkit-animation: loading 1.5s infinite ease-in-out; animation: loading 1.5s infinite ease-in-out; background: #fff; }
    `;

    // ### Template
    /* tslint:disable:member-ordering */
    /* tslint:disable:max-line-length */
    private overlayHtml: string = `
        <div class="dosbox-loader">
            <div class="st-loader">
                <span class="equal"></span>
            </div>
            <div class="dosbox-loader-message"></div>
        </div>
        <div class="dosbox-powered">
            Powered by &nbsp;<a href="https://js-dos.com">js-dos.com</a> (6.22)
        </div>
    `;
}
