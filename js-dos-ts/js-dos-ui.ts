import { DosModule } from "./js-dos-module";

// JsDosUi
// =======
// Optional ui module to show progress if onprogress is not set by client

export class JsDosUi {
    private canvas: HTMLCanvasElement;
    private dos: DosModule;
    
    // private overlay: HTMLDivElement;
    // private loaderMessage: HTMLDivElement;

    constructor(dos: DosModule) {
        if (document.getElementById("js-dos-ui-css") === null) {
            const style = document.createElement("style") as HTMLStyleElement;
            style.id = "js-dos-ui-css";
            style.innerHTML = this.css;
            document.head.appendChild(style);
        }

        this.dos = dos;
        this.canvas = dos.canvas;

        if (this.canvas.parentElement.className !== "dosbox-container") {
            const wrapper = document.createElement("div") as HTMLDivElement;
            wrapper.className = "dosbox-container";

            const parent = this.canvas.parentElement;
            parent.replaceChild(wrapper, this.canvas);
            wrapper.appendChild(this.canvas);

            const overlay = document.createElement("div") as HTMLDivElement;
            overlay.className = "dosbox-overlay";
            wrapper.appendChild(overlay);

            overlay.innerHTML = this.overlayHtml;
        }
    }

    public onprogress(total: number, loaded: number) {
        this.dos.info("UI.progress " + loaded * 100 / total + "%");
    }

    /* tslint:disable:member-ordering */
    /* tslint:disable:max-line-length */
    private css: string = `
    .dosbox-container { position: relative; min-width: 320px; min-height: 200px; display: inline-block; }
    .dosbox-overlay, .dosbox-loader { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background-color: #333; }
    .dosbox-start { text-align: center; position: absolute; left: 0; right: 0; bottom: 50%; color: #f80; font-size: 1.5em; text-decoration: underline; cursor: pointer; }
    .dosbox-overlay a { color: #f80; }
    .dosbox-powered { position: absolute; right: 1em; bottom: 1em; font-size: 0.8em; color: #9C9C9C; }
    .dosbox-loader-message { text-align: center; position: absolute; left: 0; right: 0; bottom: 50%; margin: 0 0 -3em 0; box-sizing: border-box; color: #f80; font-size: 1.5em; }
    @-moz-keyframes loading { 0% { left: 0; } 50% { left: 8.33333em; } 100% { left: 0; } } @-webkit-keyframes loading { 0% { left: 0; } 50% { left: 8.33333em; } 100% { left: 0; } } @keyframes loading { 0% { left: 0; } 50% { left: 8.33333em; } 100% { left: 0; } } .st-loader { width: 10em; height: 2.5em; position: absolute; top: 50%; left: 50%; margin: -1.25em 0 0 -5em; box-sizing: border-box; }
    .st-loader:before, .st-loader:after { content: ""; display: block; position: absolute; top: 0; bottom: 0; width: 1.25em; box-sizing: border-box; border: 0.25em solid #f80; }
    .st-loader:before { left: -0.76923em; border-right: 0; }
    .st-loader:after { right: -0.76923em; border-left: 0; }
    .st-loader .equal { display: block; position: absolute; top: 50%; margin-top: -0.5em; left: 4.16667em; height: 1em; width: 1.66667em; border: 0.25em solid #f80; box-sizing: border-box; border-width: 0.25em 0; -moz-animation: loading 1.5s infinite ease-in-out; -webkit-animation: loading 1.5s infinite ease-in-out; animation: loading 1.5s infinite ease-in-out; }
    `;

    /* tslint:disable:member-ordering */
    /* tslint:disable:max-line-length */
    private overlayHtml: string = `
        <div class="dosbox-overlay">
            <div class="dosbox-loader">
                <div class="st-loader">
                    <span class="equal"></span>
                    <div class="dosbox-loader-message"></div>
                </div>
            </div>
            <div class="dosbox-powered">
                Powered by &nbsp;<a href="https://js-dos.com">js-dos.com</a>
            </div>
        </div>
    `;
}
