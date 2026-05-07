import { CommandInterface } from "emulators";
import { domToKeyCode, KBD_pause } from "./keys";
import { Dispatch } from "@reduxjs/toolkit";
import { sendQuickLoadEvent, sendQuickSaveEvent } from "../../../player-api";
import { uiSlice } from "../../../store/ui";
import { dosSlice } from "../../../store/dos";

export function keyboard(el: HTMLElement, ci: CommandInterface, handleQuickSaves: boolean, dispatch: Dispatch, paused: boolean) {
    const pressedKeys = new Set<number>();

    function releaseKeys() {
        pressedKeys.forEach((keyCode) => {
            ci.sendKeyEvent(keyCode, false);
        });
        pressedKeys.clear();
    }

    function onKeyDown(e: KeyboardEvent) {
        if ((e.target as any).type === "text") {
            return;
        }

        if (handleQuickSaves) {
            if (e.key === "F6") {
                sendQuickSaveEvent(ci);
                dispatch(uiSlice.actions.setHaveQuickSave(true));
            }

            if (e.key === "F7") {
                sendQuickLoadEvent(ci);
            }
        }

        const keyCode = domToKeyCode(e.keyCode, e.location);
        if (keyCode === KBD_pause) {
            if (paused) ci.resume();
            else ci.pause();
            dispatch(dosSlice.actions.paused(!paused));
        }
        else {
            ci.sendKeyEvent(keyCode, true);
            pressedKeys.add(keyCode);
            e.stopPropagation();
            e.preventDefault();
        }
    }

    function onKeyUp(e: KeyboardEvent) {
        if ((e.target as any).type === "text") {
            return;
        }
        const keyCode = domToKeyCode(e.keyCode, e.location);
        ci.sendKeyEvent(keyCode, false);
        pressedKeys.delete(keyCode);
        e.stopPropagation();
        e.preventDefault();
    }

    function onBlur() {
        releaseKeys();
    }

    el.addEventListener("keydown", onKeyDown);
    el.addEventListener("keyup", onKeyUp);
    el.addEventListener("blur", onBlur);

    return () => {
        releaseKeys();
        el.removeEventListener("keydown", onKeyDown);
        el.removeEventListener("keyup", onKeyUp);
        el.removeEventListener("blur", onBlur);
    };
}
