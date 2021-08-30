export function createDiv(className: string, innerHtml?: string) {
    const el = document.createElement("div");
    el.className = className;
    if (innerHtml !== undefined) {
        el.innerHTML = innerHtml;
    }
    return el;
}