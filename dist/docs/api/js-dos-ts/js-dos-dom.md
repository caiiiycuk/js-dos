



# DosDom
Simple API to work with DOM


  

```

const isTouchDevice = "ontouchstart" in document.documentElement;


```







### applyCss - add new css style if no html element with id exists


  

```
export function applyCss(id: string, css: string) {
    if (document.getElementById(id) === null) {
        const style = document.createElement("style") as HTMLStyleElement;
        style.id = id;
        style.innerHTML = css;
        document.head.appendChild(style);
    }
}


```







### createDiv - typesafe shortcut for creating HTMLDivElement


  

```
export function createDiv(className?: string, css?: string): HTMLDivElement {
    const el = document.createElement("div") as HTMLDivElement;

    if (className !== undefined) {
        el.className = className;
    }

    if (css !== undefined) {
        applyCss(className + "-style", css);
    }

    return el;
}


```







### addButtonListener - create touch & mouse listeners that send onPress & onRelease
events


  

```
export function addButtonListener(el: HTMLElement,
                                  onPress: () => void,
                                  onRelease: () => void) {
    let isTouchHeld = false;

    if (isTouchDevice) {
        const heldTouches: { [index: string]: number } = {};
        const multitouch = (event: TouchEvent) => {
            if (event.target !== el) {
                return;
            }

            const touches = event.changedTouches;

```







tslint:disable-next-line:prefer-for-of


  

```
            for (let touchIndex = 0; touchIndex < touches.length; touchIndex++) {
                const main = touches[touchIndex];
                const identifier = main.identifier;

                switch (event.type) {
                    case "touchstart": {
                        if (Object.keys(heldTouches).length === 0) {
                            onPress();
                        }
                        heldTouches[identifier] = 1;
                    }                  break;
                    case "touchend": {
                        delete heldTouches[identifier];
                        if (Object.keys(heldTouches).length === 0) {
                            onRelease();
                        }
                    }                break;
                    default: return;
                }

                isTouchHeld = Object.keys(heldTouches).length > 0;
                event.preventDefault();
            }
        };

        el.addEventListener("touchmove", multitouch, true);
        el.addEventListener("touchstart", multitouch, true);
        el.addEventListener("touchend", multitouch, true);
    }

    let isMousePressed = false;
    const onMouseButtonDown = (event: any) => {
        if (isTouchHeld || event.button !== 0 || event.target !== el) {
            return;
        }
        isMousePressed = true;
        onPress();
        event.preventDefault();
    };
    const onMouseButtonUp = (event: any) => {
        if (isTouchHeld || !isMousePressed || event.button !== 0) {
            return;
        }
        isMousePressed = false;
        onRelease();
        event.preventDefault();
    };

    const onMouseLeave = (event: any) => {
        if (isTouchHeld || !isMousePressed || event.button !== 0) {
            return;
        }
        isMousePressed = false;
        onRelease();
    };

    el.addEventListener("mousedown", onMouseButtonDown, true);
    el.addEventListener("mouseup", onMouseButtonUp, true);
    el.addEventListener("mouseleave", onMouseLeave, true);
}


```




