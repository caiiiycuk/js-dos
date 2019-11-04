// # DosDom
// Simple API to work with DOM

// ### applyCss - add new css style if no html element with id exists
export function applyCss(id: string, css: string) {
    if (document.getElementById(id) === null) {
        const style = document.createElement("style") as HTMLStyleElement;
        style.id = id;
        style.innerHTML = css;
        document.head.appendChild(style);
    }
}

// ### createDiv - typesafe shortcut for creating HTMLDivElement
export function createDiv(className?: string): HTMLDivElement {
    const el = document.createElement("div") as HTMLDivElement;
    if (className !== undefined) {
        el.className = className;
    }
    return el;
}
