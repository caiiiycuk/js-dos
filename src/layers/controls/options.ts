import { Layers } from "../dom/layers";
import { createButton } from "./button";
import { createDiv, stopPropagation } from "../dom/helpers";

export function options(layers: Layers,
                        layersNames: string[],
                        onLayerChange: (layer: string) => void,
                        size: number,
                        top: number,
                        right: number) {
    const ident = Math.round(size / 4);

    let controlsVisbile = false;
    let keyboardVisible = false;

    const updateVisibility = () => {
        const display = controlsVisbile ? "flex" : "none";
        for (const next of children) {
            if (next == options) {
                continue;
            }

            next.style.display = display;
        }
    };

    const toggleOptions = () => {
        controlsVisbile = !controlsVisbile;

        if (!controlsVisbile && keyboardVisible) {
            layers.toggleKeyboard();
        }

        updateVisibility();
    };

    const children: HTMLElement[] = [
        createSelectForLayers(layersNames, onLayerChange),
        createButton("keyboard", {
            onClick: () => {
                layers.toggleKeyboard();

                if (controlsVisbile && !keyboardVisible) {
                    controlsVisbile = false;
                    updateVisibility();
                }
            },
        }, size),
        createButton("save", {
            onClick: () => {
                layers.save();

                if (controlsVisbile) {
                    toggleOptions();
                }
            },
        }, size),
        createButton("fullscreen", {
            onClick: () => {
                layers.toggleFullscreen();

                if (controlsVisbile) {
                    toggleOptions();
                }
            },
        }, size),
        createButton("options", {
            onClick: toggleOptions,
        }, size),
    ];
    const options = children[children.length - 1];
    const fullscreen = children[children.length - 2].children[0];
    const keyboard = children[children.length - 4].children[0];

    const onKeyboardVisibility = (visible: boolean) => {
        keyboardVisible = visible;

        if (visible) {
            keyboard.classList.add("emulator-control-close-icon");
        } else {
            keyboard.classList.remove("emulator-control-close-icon");
        }
    };
    layers.setOnKeyboardVisibility(onKeyboardVisibility);
    onKeyboardVisibility(layers.keyboardVisible);

    layers.setOnFullscreen((fullscreenEnabled) => {
        if (fullscreenEnabled) {
            if (!fullscreen.classList.contains("emulator-control-exit-fullscreen-icon")) {
                fullscreen.classList.add("emulator-control-exit-fullscreen-icon");
            }
        } else {
            fullscreen.classList.remove("emulator-control-exit-fullscreen-icon");
        }
    });

    if (layers.fullscreen) {
        fullscreen.classList.add("emulator-control-exit-fullscreen-icon");
    }

    const container = createDiv("emulator-options");
    const intialDisplay = keyboardVisible ? "flex" : "none";
    for (const next of children) {
        if (next !== options) {
            next.classList.add("emulator-button-control");
        }
        next.style.marginRight = ident + "px";
        next.style.marginBottom = ident + "px";
        if (next !== options) {
            next.style.display = intialDisplay;
        }
        container.appendChild(next);
    }

    container.style.position = "absolute";
    container.style.right = right + "px";
    container.style.top = top + "px";

    layers.mouseOverlay.appendChild(container);

    return () => {
        layers.mouseOverlay.removeChild(container);
        layers.setOnFullscreen(() => {/**/});
        layers.removeOnKeyboardVisibility(onKeyboardVisibility);
    };
}

function createSelectForLayers(layers: string[], onChange: (layer: string) => void) {
    if (layers.length <= 1) {
        return document.createElement("div");
    }

    const select = document.createElement("select");
    select.classList.add("emulator-control-select");


    for (const next of layers) {
        const option = document.createElement("option");
        option.value = next;
        option.innerHTML = next;
        select.appendChild(option);
    }

    select.onchange = (e: any) => {
        const layer = e.target.value;
        onChange(layer);
    };

    stopPropagation(select, false);

    return select;
}

