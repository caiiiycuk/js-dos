import { Dispatch } from "@reduxjs/toolkit";
import JSZip from "jszip";
import CheckboxTree from "react-checkbox-tree";
import { nonSerializedDosState } from "../../store/dos";
import { editorSlice } from "../../store/editor";
import { uiSlice } from "../../store/ui";

export class ExplorerRoot {
    root: JSZip;
    constructor(root?: JSZip) {
        this.root = root ?? new JSZip();
    }
    getFiles() {
        console.log(this.root.files);
    }
}

export async function newEditor(bundle: Uint8Array, dispatch: Dispatch) {
    try {
        nonSerializedDosState.editorBundle = bundle;
        dispatch(uiSlice.actions.windowEditor());
        dispatch(editorSlice.actions.extract());
        const root = await JSZip.loadAsync(bundle);
        nonSerializedDosState.editorExplorer = new ExplorerRoot(root);
        dispatch(editorSlice.actions.stepConf());

        nonSerializedDosState.editorExplorer.getFiles();
    } catch (e: any) {
        dispatch(editorSlice.actions.error(e.message ?? "unknow error"));
    }
}

export function EditorExplorer() {
    return <div>
        <CheckboxTree nodes={[]}></CheckboxTree>
    </div>;
}
