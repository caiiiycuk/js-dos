export declare const html: (strings: TemplateStringsArray, ...values: any[]) => import("preact").VNode<any> | import("preact").VNode<any>[];
export declare const goneClass = "jsdos-player-gone";
export declare const disabledClass = "jsdos-player-button-disabled";
export declare const primaryClass = "jsdos-player-button-primary";
export declare const activeClass = "jsdos-player-button-active";
export declare function createDiv(className: string | string[], innerHtml?: string): HTMLDivElement;
export declare function click(el: HTMLElement, callbackFn: (el: HTMLElement) => void): void;
export declare function downloadFile(data: Uint8Array, fileName: string, mimeType: string): void;
