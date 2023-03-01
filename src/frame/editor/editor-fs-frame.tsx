import { FsNode } from "emulators";
import { useEffect, useState } from "preact/hooks";
import CheckboxTree, { Node, OnCheckNode, OnExpandNode } from "react-checkbox-tree";
import { useSelector } from "react-redux";
import { State } from "../../store";
import { nonSerializedDosState } from "../../store/dos";

interface NodeExt extends Node {
    fsNode: FsNode,
}

export function EditorFsFrame() {
    const haveCi = useSelector((state: State) => state.dos.ci);
    const [fsTree, setFsTree] = useState<NodeExt[] | null>(null);
    const [expanded, setExpanded] = useState<string[]>([]);
    const [checked, setChecked] = useState<string[]>([]);

    useEffect(() => {
        const ci = nonSerializedDosState.ci;
        if (ci === null || !haveCi) {
            return;
        }

        let cancled = false;
        ci.fsTree()
            .then((tree) => {
                if (!cancled) {
                    setFsTree(toNodes(tree));
                }
            })
            .catch((e) => {
                console.error(e);
                if (!cancled) {
                    setFsTree(null);
                }
            });

        return () => {
            cancled = true;
        };
    }, [haveCi]);


    function onExpand(expanded: Array<string>, node: OnExpandNode) {
        setExpanded(expanded);
    }

    function onCheck(checked: Array<string>, node: OnCheckNode) {
        setChecked(checked);
    }

    // const check = <input type="checkbox" class="checkbox" />;
    return <div class="editor-fs-frame frame-root items-start px-4">
        <div className="fs-tree-view">
            {fsTree && <CheckboxTree
                icons={{
                    expandOpen: <FolderOpened /> as any,
                    expandClose: <FolderClosed /> as any,
                    // expandAll: <div class="bg-red-100 w-4 h-4"></div> as any,
                    // parentOpen: <div class="bg-blue-100 w-4 h-4"></div> as any,
                    // parentClose: <div class="bg-purple-100 w-4 h-4"></div> as any,
                }}
                iconsClass="icon"
                nativeCheckboxes={false}
                onlyLeafCheckboxes={true}
                nodes={fsTree}
                checked={checked}
                onCheck={onCheck}
                expanded={expanded}
                onExpand={onExpand} />}
        </div>
    </div>;
}

function toNodes(fsTree: FsNode): NodeExt[] {
    const fs: NodeExt[] = [];
    for (const next of (fsTree.nodes?.sort(nodeSorter) || [])) {
        fs.push(toNode(next, "."));
    }
    return fs;
}

function toNode(fsNode: FsNode, path: string): NodeExt {
    const fullPath = path + "/" + fsNode.name;
    const nodeExt: NodeExt = {
        label: fsNode.name,
        value: fullPath,
        fsNode,
    };

    if (fsNode.nodes !== null) {
        const children = fsNode.nodes.sort(nodeSorter)
            .map((next) => toNode(next, fullPath));
        nodeExt.children = children;
    }

    return nodeExt;
}

function nodeSorter(a: FsNode, b: FsNode) {
    if (a.nodes !== null && b.nodes !== null) {
        return b.name.localeCompare(a.name);
    }

    return a.nodes === null ? 1 : -1;
}

function FolderOpened() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>;
}

function FolderClosed() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
        stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>;
}
