import { Layers } from "../dom/layers";
import { CommandInterface } from "emulators";
import {
    LayersConfig, LayerConfig, LayerKeyControl,
    LayerControl, LayerSwitchControl, LayerScreenMoveControl,
    LayerPointerButtonControl, LayerPointerMoveControl, LayerPointerResetControl,
    LayerPointerToggleControl, LayerNippleActivatorControl,
} from "./layers-config";
import { Cell, getGrid, GridConfiguration } from "./grid";
import { createButton } from "./button";
import { DosInstance } from "../js-dos";
import { keyboard } from "./keyboard";
import { mouse } from "./mouse/mouse-common";
import { options } from "./options";
import { pointer } from "../dom/pointer";

// eslint-disable-next-line
const nipplejs = require("nipplejs");

export function initLayersControl(
    layers: Layers,
    layersConfig: LayersConfig,
    ci: CommandInterface,
    dosInstance: DosInstance,
    mirrored: boolean,
    scale: number,
    layerName?: string): () => void {
    let selectedLayer = layersConfig.layers[0];
    if (layerName !== undefined) {
        for (const next of layersConfig.layers) {
            if (next.title === layerName) {
                selectedLayer = next;
                break;
            }
        }
    }
    return initLayerConfig(selectedLayer, layers, ci, dosInstance, mirrored, scale);
}

interface CellWithMeta extends Cell {
    hidden?: boolean,
}

interface Sensor {
    activate: () => void;
    deactivate: () => void;
}

interface MirroredInfo {
    leftStart: number;
    leftEnd: number;
    rightStart: number;
    rightEnd: number;
}

class ControlSensors {
    sensors: { [key: string]: Sensor } = {};

    activate(row: number, column: number) {
        const sensor = this.sensors[column + "_" + row];
        if (sensor !== undefined) {
            sensor.activate();
        }
    }

    deactivate(row: number, column: number) {
        const sensor = this.sensors[column + "_" + row];
        if (sensor !== undefined) {
            sensor.deactivate();
        }
    }

    register(row: number, column: number, sensor: Sensor) {
        this.sensors[column + "_" + row] = sensor;
    }
}

type ControlFactory = (control: any,
    layers: Layers,
    ci: CommandInterface,
    gridConfig: GridConfiguration,
    sensors: ControlSensors,
    dosInstance: DosInstance) => () => void;

const factoryMapping: { [type: string]: ControlFactory } = {
    Key: createKeyControl,
    Options: createOptionsControl,
    Keyboard: createKeyboardControl,
    Switch: createSwitchControl,
    ScreenMove: createScreenMoveControl,
    PointerButton: createPointerButtonControl,
    PointerMove: createPointerMoveControl,
    PointerReset: createPointerResetControl,
    PointerToggle: createPointerToggleControl,
    NippleActivator: createNippleActivatorControl,
};

function initLayerConfig(layerConfig: LayerConfig,
                         layers: Layers,
                         ci: CommandInterface,
                         dosInstance: DosInstance,
                         mirrored: boolean,
                         scale: number): () => void {
    const unbindKeyboard = keyboard(layers, ci);
    const unbindMouse = mouse(dosInstance.autolock, dosInstance.sensitivity, layers, ci);

    const unbindControls: (() => void)[] = [];
    function rebuild(width: number, height: number) {
        for (const next of unbindControls) {
            next();
        }
        unbindControls.splice(0, unbindControls.length);

        const grid = getGrid(layerConfig.grid);
        const gridConfig = grid.getConfiguration(width, height, scale);
        const sensors = new ControlSensors();

        for (const next of layerConfig.controls) {
            const { row, column, type } = next;
            if (type === "NippleActivator") {
                setHiddenAround(gridConfig, row, column);
            }
        }

        let doOffsetColumnInRow = -1;
        if (layers.options.optionControls?.length === 0) {
            for (const next of layerConfig.controls) {
                const { row, type } = next;
                if (type === "Options") {
                    doOffsetColumnInRow = row;
                    break;
                }
            }
        }

        const mirroredInfo: { [row: number]: MirroredInfo } = {};
        if (mirrored) {
            for (const next of layerConfig.controls) {
                const { row } = next;
                let column = next.column;
                const columnsCount = gridConfig.cells[row].length;
                const middleColumn = columnsCount / 2;

                if (row === doOffsetColumnInRow && column >= middleColumn) {
                    column = Math.min(column + 1, columnsCount - 1);
                }

                if (mirroredInfo[row] === undefined) {
                    mirroredInfo[row] = {
                        leftStart: middleColumn,
                        leftEnd: 0,
                        rightStart: columnsCount - 1,
                        rightEnd: middleColumn,
                    };
                }

                if (column < middleColumn) {
                    mirroredInfo[row].leftStart = Math.min(mirroredInfo[row].leftStart, column);
                    mirroredInfo[row].leftEnd = Math.max(mirroredInfo[row].leftEnd, column);
                } else {
                    mirroredInfo[row].rightStart = Math.min(mirroredInfo[row].rightStart, column);
                    mirroredInfo[row].rightEnd = Math.max(mirroredInfo[row].rightEnd, column);
                }
            }
        }

        for (const next of layerConfig.controls) {
            const factory = factoryMapping[next.type];
            if (factory === undefined) {
                console.error("Factory for control '" + next.type + "' is not defined");
                continue;
            }

            const copy = { ...next };
            const columnsCount = gridConfig.cells[next.row].length;
            const middleColumn = columnsCount / 2;
            if (doOffsetColumnInRow === next.row && next.column >= middleColumn) {
                copy.column = Math.min(copy.column + 1, columnsCount - 1);
            }

            if (mirrored) {
                const { leftStart, leftEnd, rightStart, rightEnd } = mirroredInfo[copy.row];
                const leftSide = copy.column < middleColumn;
                if (leftSide) {
                    copy.column += middleColumn + (middleColumn - leftEnd) - leftStart - 1;
                } else {
                    copy.column -= middleColumn + (rightStart - middleColumn) - (columnsCount - rightEnd) + 1;
                }

                if (copy.column >= columnsCount) {
                    console.error("Column", copy.column, "is out of bound",
                        columnsCount, leftSide ? "[leftSide]" : "[rightSide]", mirroredInfo);
                    copy.column = columnsCount - 1;
                } else if (copy.column < 0) {
                    console.error("Column", copy.column, "is out of bound",
                        0, leftSide ? "[leftSide]" : "[rightSide]", mirroredInfo);
                    copy.column = 0;
                }
            }

            const unbind = factory(copy, layers, ci, gridConfig, sensors, dosInstance);
            unbindControls.push(unbind);
        }
    }

    layers.addOnResize(rebuild);
    rebuild(layers.width, layers.height);

    return () => {
        layers.removeOnResize(rebuild);
        unbindKeyboard();
        unbindMouse();
        for (const next of unbindControls) {
            next();
        }
    };
}

function createKeyControl(keyControl: LayerKeyControl,
                          layers: Layers,
                          ci: CommandInterface,
                          gridConfig: GridConfiguration,
                          sensors: ControlSensors,
                          dosInstance: DosInstance) {
    const { cells, columnWidth } = gridConfig;
    const { row, column } = keyControl;
    const { centerX, centerY } = cells[row][column];

    const handler = {
        onDown: () => {
            for (const next of keyControl.mapTo) {
                ci.sendKeyEvent(next, true);
            }
        },
        onUp: () => {
            for (const next of keyControl.mapTo) {
                ci.sendKeyEvent(next, false);
            }
        },
    };

    sensors.register(row, column, {
        activate: handler.onDown,
        deactivate: handler.onUp,
    });

    if (isHidden(gridConfig, row, column)) {
        return () => {};
    }

    const button = createButton(keyControl.symbol, handler, columnWidth);

    button.style.position = "absolute";
    button.style.left = (centerX - button.widthPx / 2) + "px";
    button.style.top = (centerY - button.heightPx / 2) + "px";

    layers.mouseOverlay.appendChild(button);
    return () => layers.mouseOverlay.removeChild(button);
}

function createOptionsControl(optionControl: LayerControl,
                              layers: Layers,
                              ci: CommandInterface,
                              gridConfig: GridConfiguration,
                              sensors: ControlSensors,
                              dosInstance: DosInstance) {
    if (layers.options.optionControls?.length === 0) {
        return () => {/**/};
    }

    if (layers.options.optionControls !== undefined &&
        layers.options.optionControls.length === 1 &&
        layers.options.optionControls[0] === "keyboard") {
        return createKeyboardControl(optionControl, layers, ci, gridConfig, sensors, dosInstance);
    }

    const { cells, columnWidth, rowHeight } = gridConfig;
    const { row, column } = optionControl;
    const { centerX, centerY } = cells[row][column];

    const top = centerY - rowHeight / 2;
    const left = centerX - columnWidth / 2;
    const right = gridConfig.width - left - columnWidth;

    return options(layers, ["default"], () => {/**/},
        columnWidth,
        top,
        right);
}

function createKeyboardControl(keyboardControl: LayerControl,
                               layers: Layers,
                               ci: CommandInterface,
                               gridConfig: GridConfiguration,
                               sensors: ControlSensors,
                               dosInstance: DosInstance) {
    const { cells, columnWidth } = gridConfig;
    const { row, column } = keyboardControl;
    const { centerX, centerY } = cells[row][column];

    const button = createButton("keyboard", {
        onUp: () => layers.toggleKeyboard(),
    }, columnWidth);

    const onKeyboardVisibility = (visible: boolean) => {
        if (visible) {
            button.children[0].classList.add("emulator-control-close-icon");
        } else {
            button.children[0].classList.remove("emulator-control-close-icon");
        }
    };
    layers.setOnKeyboardVisibility(onKeyboardVisibility);

    button.style.position = "absolute";
    button.style.left = (centerX - button.widthPx / 2) + "px";
    button.style.top = (centerY - button.heightPx / 2) + "px";

    layers.mouseOverlay.appendChild(button);
    return () => {
        layers.mouseOverlay.removeChild(button);
        layers.removeOnKeyboardVisibility(onKeyboardVisibility);
    };
}

function createSwitchControl(switchControl: LayerSwitchControl,
                             layers: Layers,
                             ci: CommandInterface,
                             gridConfig: GridConfiguration,
                             sensors: ControlSensors,
                             dosInstance: DosInstance) {
    const { cells, columnWidth } = gridConfig;
    const { row, column } = switchControl;
    const { centerX, centerY } = cells[row][column];

    const button = createButton(switchControl.symbol, {
        onUp: () => dosInstance.setLayersConfig(dosInstance.getLayersConfig(), switchControl.layerName),
    }, columnWidth);

    button.style.position = "absolute";
    button.style.left = (centerX - button.widthPx / 2) + "px";
    button.style.top = (centerY - button.heightPx / 2) + "px";

    layers.mouseOverlay.appendChild(button);
    return () => {
        layers.mouseOverlay.removeChild(button);
    };
}

function createScreenMoveControl(screenMoveControl: LayerScreenMoveControl,
                                 layers: Layers,
                                 ci: CommandInterface,
                                 gridConfig: GridConfiguration,
                                 sensors: ControlSensors,
                                 dosInstance: DosInstance) {
    const { cells, columnWidth } = gridConfig;
    const { row, column } = screenMoveControl;
    const { centerX, centerY } = cells[row][column];

    let mX = 0.5;
    let mY = 0.5;

    if (screenMoveControl.direction.indexOf("up") >= 0) {
        mY = 0;
    }

    if (screenMoveControl.direction.indexOf("down") >= 0) {
        mY = 1;
    }

    if (screenMoveControl.direction.indexOf("left") >= 0) {
        mX = 0;
    }

    if (screenMoveControl.direction.indexOf("right") >= 0) {
        mX = 1;
    }

    const handler = {
        onDown: () => {
            ci.sendMouseMotion(mX, mY);
        },
        onUp: () => {
            ci.sendMouseMotion(0.5, 0.5);
        },
    };

    sensors.register(row, column, {
        activate: handler.onDown,
        deactivate: handler.onUp,
    });

    if (isHidden(gridConfig, row, column)) {
        return () => {};
    }

    const button = createButton(screenMoveControl.symbol, handler, columnWidth);

    button.style.position = "absolute";
    button.style.left = (centerX - button.widthPx / 2) + "px";
    button.style.top = (centerY - button.heightPx / 2) + "px";

    layers.mouseOverlay.appendChild(button);
    return () => layers.mouseOverlay.removeChild(button);
}

function createPointerButtonControl(pointerButtonControl: LayerPointerButtonControl,
                                    layers: Layers,
                                    ci: CommandInterface,
                                    gridConfig: GridConfiguration,
                                    sensors: ControlSensors,
                                    dosInstance: DosInstance) {
    const { cells, columnWidth } = gridConfig;
    const { row, column, click } = pointerButtonControl;
    const { centerX, centerY } = cells[row][column];

    const handler = {
        onDown: () => {
            if (!click) {
                layers.pointerButton = pointerButtonControl.button;
            } else {
                ci.sendMouseButton(pointerButtonControl.button, true);
            }
        },
        onUp: () => {
            if (!click) {
                layers.pointerButton = 0;
            } else {
                ci.sendMouseButton(pointerButtonControl.button, false);
            }
        },
    };

    sensors.register(row, column, {
        activate: handler.onDown,
        deactivate: handler.onUp,
    });

    if (isHidden(gridConfig, row, column)) {
        return () => {};
    }

    const button = createButton(pointerButtonControl.symbol, handler, columnWidth);

    button.style.position = "absolute";
    button.style.left = (centerX - button.widthPx / 2) + "px";
    button.style.top = (centerY - button.heightPx / 2) + "px";

    layers.mouseOverlay.appendChild(button);
    return () => layers.mouseOverlay.removeChild(button);
}

function createPointerMoveControl(pointerMoveControl: LayerPointerMoveControl,
                                  layers: Layers,
                                  ci: CommandInterface,
                                  gridConfig: GridConfiguration,
                                  sensors: ControlSensors,
                                  dosInstance: DosInstance) {
    const { cells, columnWidth } = gridConfig;
    const { row, column, x, y } = pointerMoveControl;
    const { centerX, centerY } = cells[row][column];

    const handler = {
        onDown: () => {
            ci.sendMouseMotion(x, y);
        },
        onUp: () => {
            ci.sendMouseMotion(x, y);
        },
    };

    sensors.register(row, column, {
        activate: handler.onDown,
        deactivate: handler.onUp,
    });

    if (isHidden(gridConfig, row, column)) {
        return () => {};
    }

    const button = createButton(pointerMoveControl.symbol, handler, columnWidth);

    button.style.position = "absolute";
    button.style.left = (centerX - button.widthPx / 2) + "px";
    button.style.top = (centerY - button.heightPx / 2) + "px";

    layers.mouseOverlay.appendChild(button);
    return () => layers.mouseOverlay.removeChild(button);
}

function createPointerResetControl(pointerResetControl: LayerPointerResetControl,
                                   layers: Layers,
                                   ci: CommandInterface,
                                   gridConfig: GridConfiguration,
                                   sensors: ControlSensors,
                                   dosInstance: DosInstance) {
    const { cells, columnWidth } = gridConfig;
    const { row, column } = pointerResetControl;
    const { centerX, centerY } = cells[row][column];

    const handler = {
        onDown: () => {
            ci.sendMouseSync();
        },
    };

    sensors.register(row, column, {
        activate: handler.onDown,
        deactivate: () => { },
    });

    if (isHidden(gridConfig, row, column)) {
        return () => {};
    }

    const button = createButton(pointerResetControl.symbol, handler, columnWidth);

    button.style.position = "absolute";
    button.style.left = (centerX - button.widthPx / 2) + "px";
    button.style.top = (centerY - button.heightPx / 2) + "px";

    layers.mouseOverlay.appendChild(button);
    return () => layers.mouseOverlay.removeChild(button);
}

function createPointerToggleControl(pointerToggleControl: LayerPointerToggleControl,
                                    layers: Layers,
                                    ci: CommandInterface,
                                    gridConfig: GridConfiguration,
                                    sensors: ControlSensors,
                                    dosInstance: DosInstance) {
    const { cells, columnWidth } = gridConfig;
    const { row, column } = pointerToggleControl;
    const { centerX, centerY } = cells[row][column];

    const handler = {
        onDown: () => {
            layers.pointerDisabled = !layers.pointerDisabled;
            if (layers.pointerDisabled) {
                if (!button.classList.contains("emulator-button-highlight")) {
                    button.classList.add("emulator-button-highlight");
                }
            } else {
                button.classList.remove("emulator-button-highlight");
            }
        },
    };

    sensors.register(row, column, {
        activate: handler.onDown,
        deactivate: () => { },
    });

    if (isHidden(gridConfig, row, column)) {
        return () => {};
    }

    const button = createButton(pointerToggleControl.symbol, handler, columnWidth);

    button.style.position = "absolute";
    button.style.left = (centerX - button.widthPx / 2) + "px";
    button.style.top = (centerY - button.heightPx / 2) + "px";

    layers.mouseOverlay.appendChild(button);
    return () => layers.mouseOverlay.removeChild(button);
}

function createNippleActivatorControl(nippleActivatorControl: LayerNippleActivatorControl,
                                      layers: Layers,
                                      ci: CommandInterface,
                                      gridConfig: GridConfiguration,
                                      sensors: ControlSensors,
                                      dosInstance: DosInstance) {
    const { cells, columnWidth, rowHeight, width, height } = gridConfig;
    const { row, column } = nippleActivatorControl;
    const { centerX, centerY } = cells[row][column];

    const nippleContainer = document.createElement("div");
    const cellSize = 1.5;
    const left = Math.max(0, centerX - columnWidth * cellSize);
    const top = Math.max(0, centerY - rowHeight * cellSize);
    const right = Math.max(0, width - centerX - columnWidth * cellSize);
    const bottom = Math.max(0, height - centerY - rowHeight * cellSize);

    nippleContainer.style.position = "absolute";
    nippleContainer.style.zIndex = "999";
    nippleContainer.style.left = left + "px";
    nippleContainer.style.top = top + "px";
    nippleContainer.style.right = right + "px";
    nippleContainer.style.bottom = bottom + "px";

    layers.mouseOverlay.appendChild(nippleContainer);

    const manager = nipplejs.create({
        zone: nippleContainer,
        multitouch: false,
        maxNumberOfNipples: 1,
        mode: "static",
        follow: false,
        dynamicPage: true,
        size: Math.max(columnWidth, rowHeight) * 1.5,
        position: {
            left: (width - right - left) / 2 + "px",
            top: (height - bottom - top) / 2 + "px",
        },
    });

    let activeColumn = -1;
    let activeRow = -1;
    manager.on("move", (evt: any, data: any) => {
        if (data.distance < 10) {
            sensors.deactivate(activeRow, activeColumn);
            activeColumn = -1;
            activeRow = -1;
            return;
        }
        let targetColumn = -1;
        let targetRow = -1;
        const step = 360 / 8;
        const half = step / 2;
        const degree = data.angle.degree;
        if (degree > half && degree <= half + step) {
            // console.log("up-right")
            targetColumn = column + 1;
            targetRow = row - 1;
        } else if (degree > half + step && degree <= half + step * 2) {
            // console.log("up");
            targetColumn = column;
            targetRow = row - 1;
        } else if (degree > half + step * 2 && degree <= half + step * 3) {
            // console.log("up-left");
            targetColumn = column - 1;
            targetRow = row - 1;
        } else if (degree > half + step * 3 && degree <= half + step * 4) {
            // console.log("left");
            targetColumn = column - 1;
            targetRow = row;
        } else if (degree > half + step * 4 && degree <= half + step * 5) {
            // console.log("down-left");
            targetColumn = column - 1;
            targetRow = row + 1;
        } else if (degree > half + step * 5 && degree <= half + step * 6) {
            // console.log("down")
            targetColumn = column;
            targetRow = row + 1;
        } else if (degree > half + step * 6 && degree <= half + step * 7) {
            // console.log("down-right");
            targetColumn = column + 1;
            targetRow = row + 1;
        } else {
            // console.log("right");
            targetColumn = column + 1;
            targetRow = row;
        }

        if (activeColumn !== targetColumn || activeRow !== targetRow) {
            sensors.deactivate(activeRow, activeColumn);
            sensors.activate(targetRow, targetColumn);
            activeColumn = targetColumn;
            activeRow = targetRow;
        }
    });

    let started = false;
    manager.on("start", () => {
        started = true;
    });

    manager.on("end", () => {
        started = false;
        sensors.deactivate(activeRow, activeColumn);
        activeRow = -1;
        activeColumn = -1;
    });

    const options = {
        capture: true,
    };

    function onEnd(e: Event) {
        if (started) {
            manager.processOnEnd(e);
        }
    }

    for (const next of pointer.enders) {
        layers.mouseOverlay.addEventListener(next, onEnd, options);
    }

    return () => {
        manager.destroy();
        layers.mouseOverlay.removeChild(nippleContainer);
        for (const next of pointer.enders) {
            layers.mouseOverlay.removeEventListener(next, onEnd, options);
        }
    };
}

function isHidden(config: GridConfiguration, row: number, column: number) {
    return (config.cells[row][column] as CellWithMeta).hidden === true;
}

function setHiddenAround(config: GridConfiguration,
                         centralRow: number,
                         centralColumn: number) {
    function setHiddenIfValid(row: number, column: number) {
        if (row === centralRow && column === centralColumn) {
            return;
        }

        if (row >= 0 && row < config.cells.length) {
            const rowCells = config.cells[row];
            if (column >= 0 && column < rowCells.length) {
                (rowCells[column] as CellWithMeta).hidden = true;
            }
        }
    }

    for (let ri = centralRow - 1; ri <= centralRow + 1; ++ri) {
        for (let ci = centralColumn - 1; ci <= centralColumn + 1; ++ci) {
            setHiddenIfValid(ri, ci);
        }
    }
}
