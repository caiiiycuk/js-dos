import { Store, getNonSerializableStore, postJsDosEvent } from "../store";
import { uiSlice } from "../store/ui";

export function browserSetFullScreen(fullScreen: boolean, store: Store) {
    (async () => {
        const softFullscreen = store.getState().ui.softFullscreen;
        const nsStore = getNonSerializableStore(store);
        const root = nsStore.root as any;
        if (fullScreen) {
            if (softFullscreen) {
                root.classList.add("jsdos-fullscreen-workaround");
            } else if (root.requestFullscreen) {
                await root.requestFullscreen();
            } else if (root.webkitRequestFullscreen) {
                await root.webkitRequestFullscreen();
            } else if (root.mozRequestFullScreen) {
                await root.mozRequestFullScreen();
            } else if (root.msRequestFullscreen) {
                await root.msRequestFullscreen();
            } else if (root.webkitEnterFullscreen) {
                await root.webkitEnterFullscreen();
            } else {
                root.classList.add("jsdos-fullscreen-workaround");
            }
        } else {
            if (root.classList.contains("jsdos-fullscreen-workaround")) {
                root.classList.remove("jsdos-fullscreen-workaround");
            } else if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                (document as any).webkitExitFullscreen();
            } else if ((document as any).mozCancelFullScreen) {
                (document as any).mozCancelFullScreen();
            } else if ((document as any).msExitFullscreen) {
                (document as any).msExitFullscreen();
            }
        }

        store.dispatch(uiSlice.actions.setFullScreen(fullScreen));
        postJsDosEvent(nsStore, "fullscreen-change", fullScreen);
    })().catch((e) => {
        console.error("Can't enter fullscreen", e);
    });
}
