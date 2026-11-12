import { createApp, h, ref, onMounted, onBeforeUnmount } from "vue";
import { loadRuntime, playerOptions } from "./runtime.js";
createApp({
    setup() {
        const container = ref(null);
        const error = ref(null);
        let disposed = false;
        let player;
        onMounted(async () => {
            try {
                const createDos = await loadRuntime();
                if (!disposed) player = createDos(container.value, playerOptions());
            } catch (failure) { if (!disposed) error.value = failure.message; }
        });
        onBeforeUnmount(() => { disposed = true; if (player) void player.stop(); });
        return () => error.value ? h("p", { role: "alert" }, error.value) : h("div", { ref: container, class: "player" });
    },
}).mount("#app");
