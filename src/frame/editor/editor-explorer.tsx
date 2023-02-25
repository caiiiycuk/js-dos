import { Dispatch } from "@reduxjs/toolkit";
import JSZip from "jszip";
import CheckboxTree from "react-checkbox-tree";
import { nonSerializedDosState } from "../../store/dos";
import { editorSlice } from "../../store/editor";

export class ExplorerRoot {
    root: JSZip;
    constructor(root?: JSZip) {
        this.root = root ?? new JSZip();
    }
    getFiles() {
        console.log(this.root.files);
    }
}


export function newEditor(bundle: Uint8Array, dispatch: Dispatch) {
    nonSerializedDosState.editorExplorer = new ExplorerRoot();
    nonSerializedDosState.editorBundle = bundle;
    dispatch(editorSlice.actions.empty());
}

export async function explorerExtract(dispatch: Dispatch) {
    try {
        dispatch(editorSlice.actions.extract());
        const root = await JSZip.loadAsync(nonSerializedDosState.editorBundle);
        nonSerializedDosState.editorExplorer = new ExplorerRoot(root);
        dispatch(editorSlice.actions.extract());
    } catch (e: any) {
        dispatch(editorSlice.actions.error(e.message ?? "unknow error"));
    }
}

export function EditorExplorer() {
    return <div>
        <CheckboxTree nodes={[]}></CheckboxTree>
    </div>;
}
