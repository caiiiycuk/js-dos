import CheckboxTree from "react-checkbox-tree";
export class ExplorerRoot {
    constructor() {
    }
    getFiles() {
    }
}

export function EditorExplorer() {
    return <div>
        <CheckboxTree nodes={[]}></CheckboxTree>
    </div>;
}
