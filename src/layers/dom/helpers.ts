import { pointer } from "./pointer";

export function createDiv(className: string, innerHtml?: string) {
    const el = document.createElement("div");
    el.className = className;
    if (innerHtml !== undefined) {
        el.innerHTML = innerHtml;
    }
    return el;
}

export function stopPropagation(el: HTMLElement, preventDefault = true) {
    const onStop = (e: Event) => {
        e.stopPropagation();
    };
    const onPrevent = (e: Event) => {
        e.stopPropagation();
        if (preventDefault) {
            e.preventDefault();
        }
    };
    const options = {
        capture: false,
    };
    for (const next of pointer.starters) {
        el.addEventListener(next, onStop, options);
    }
    for (const next of pointer.enders) {
        el.addEventListener(next, onStop, options);
    }
    for (const next of pointer.prevents) {
        el.addEventListener(next, onPrevent, options);
    }
}
