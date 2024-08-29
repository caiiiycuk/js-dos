import { FsNode } from "emulators/dist/types/protocol/protocol";
import { useEffect, useRef, useState } from "preact/hooks";
import CheckboxTree, { Node, OnCheckNode, OnExpandNode } from "react-checkbox-tree";
import { useSelector, useStore } from "react-redux";
import { useT } from "../../i18n";
import { loadBundle } from "../../player-api-load";
import { State, useNonSerializableStore } from "../../store";
import { downloadArrayToFs } from "../../download-file";

interface NodeExt extends Node {
    fsNode: FsNode,
}

export function EditorFsFrame() {
    const t = useT();
    const haveCi = useSelector((state: State) => state.dos.ci);
    const nonSerializableStore = useNonSerializableStore();
    const [fsSize, setFsSize] = useState<number>(0);
    const [fsTree, _setFsTree] = useState<NodeExt[] | null>(null);
    const [expanded, setExpanded] = useState<string[]>([]);
    const [checked, setChecked] = useState<string[]>([]);
    const [uploadingFile, setUploadingFile] = useState<string | null>(null);
    const [makingBundle, setMakingBundle] = useState<boolean>(false);

    function setFsTree(fsTree: NodeExt[] | null) {
        _setFsTree(fsTree);
        setFsSize(Math.round(calcFsSize(fsTree) / 1024 / 1024 * 100) / 100);
    }

    useEffect(() => {
        if (nonSerializableStore.ci === null || !haveCi) {
            return;
        }

        let cancled = false;
        nonSerializableStore.ci.fsTree()
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

    async function onRefresh() {
        setFsTree(null);
        if (nonSerializableStore.ci === null || !haveCi) {
            return;
        }
        const tree = await nonSerializableStore.ci.fsTree();
        setFsTree(toNodes(tree));
    }

    // const check = <input type="checkbox" class="checkbox" />;
    return <div class="editor-fs-frame frame-root items-start px-4">
        {(makingBundle || uploadingFile !== null) &&
        <div class="card card-bordered bg-base-100 shadow-xl w-full">
            <div class="card-body">
                <div class="card-title">
                    {t(makingBundle ? "please_wait" : "uploading_file")}
                </div>
                <span class="break-words">
                    {makingBundle ? t("making_bundle") : uploadingFile}
                </span>
            </div>
        </div>}
        {!makingBundle && uploadingFile === null && fsTree &&
        <div className="fs-tree-view">
            <Actions
                onRefresh={onRefresh}
                onUploadingFile={setUploadingFile}
                onMakingBundle={setMakingBundle} />
            <div class="bg-base-200 px-2 py-1 text-right">
                {t("size")}: {fsSize} Mb
            </div>
            <div class="fs-tree">
                <CheckboxTree
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
                    onExpand={onExpand} />
            </div>
        </div>}
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

function Actions(props: {
    onRefresh: () => void,
    onUploadingFile: (file: string | null) => void,
    onMakingBundle: (making: boolean) => void,
}) {
    const t = useT();
    const uploadDirRef = useRef<HTMLInputElement>(null);
    const uploadFileRef = useRef<HTMLInputElement>(null);
    const store = useStore();
    const nonSerializableStore = useNonSerializableStore();
    const { onRefresh, onUploadingFile, onMakingBundle } = props;

    useEffect(() => {
        if (uploadDirRef.current !== null) {
            uploadDirRef.current.setAttribute("directory", "");
            uploadDirRef.current.setAttribute("webkitdirectory", "");
        }
    }, [uploadDirRef]);

    function onUploadClick(file: boolean) {
        const input = (file ? uploadFileRef : uploadDirRef).current;
        if (input === null) {
            return;
        }

        input.click();
    }

    async function onUpload(event: any) {
        const ci = nonSerializableStore.ci;
        const files: FileList = event.target.files;
        if (ci === null || files === null) {
            return;
        }

        try {
            for (const file of files) {
                onUploadingFile(file.name);
                const parts = (file.webkitRelativePath ?? "").split("/");
                parts.shift();
                const relPath = parts.join("/");
                await ci.fsWriteFile(relPath.length == 0 ? file.name : relPath, file.stream());
            }
        } finally {
            onUploadingFile(null);
        }

        await onRefresh();
    }

    async function onRestart() {
        const ci = nonSerializableStore.ci;
        if (ci === null || !window.confirm(t("fs_restart"))) {
            return;
        }

        onMakingBundle(true);
        try {
            const bundle = await ci.persist(false);
            if (bundle) {
                loadBundle(bundle, true, store);
            }
        } finally {
            onMakingBundle(false);
        }
    }

    async function onDownload() {
        const ci = nonSerializableStore.ci;
        if (ci === null) {
            return;
        }

        onMakingBundle(true);
        try {
            const bundle = await ci.persist(false);
            if (bundle) {
                downloadArrayToFs("bundle.jsdos", bundle);
            }
        } finally {
            onMakingBundle(false);
        }
    }

    return <div class="h-6 flex flex-row">
        <input class="hidden" type="file" multiple ref={uploadDirRef} onChange={onUpload} />
        <input class="hidden" type="file" multiple ref={uploadFileRef} onChange={onUpload} />
        <button class="refresh btn-xs rounded-none" onClick={onRefresh}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181
                    3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181
                    3.182m0-4.991v4.99" />
            </svg>
        </button>
        <button class="add-file btn-xs rounded-none" onClick={() => onUploadClick(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375
                    3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0
                    00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125
                    1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9
                     9 0 00-9-9z" />
            </svg>
        </button>
        <button class="add-dir btn-xs rounded-none" onClick={() => onUploadClick(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25
                    2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75
                    18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
        </button>
        <div class="flex-grow"></div>
        <button class="download btn-xs rounded-none" onClick={onDownload}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 13.5l3 3m0 0l3-3m-3
                    3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25
                    0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5
                    0 01-1.06-.44z" />
            </svg>
        </button>
        <button class="restart btn-xs rounded-none" onClick={onRestart}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5V18M15 7.5V18M3
                    16.811V8.69c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108
                    4.061A1.125 1.125 0 013 16.811z" />
            </svg>
        </button>
    </div>;
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

function calcFsSize(fsTree: NodeExt[] | null) {
    if (!fsTree) {
        return 0;
    }

    let size = 0;
    for (const next of fsTree) {
        if (next.fsNode.size !== null) {
            size += next.fsNode.size!;
        } else {
            size += calcFsSize(next.children as NodeExt[]);
        }
    }

    return size;
}
