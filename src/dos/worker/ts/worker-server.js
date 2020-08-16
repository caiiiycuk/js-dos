onmessage = (e) => {
    const data = e.data;
    if (data === undefined) {
        return;
    }

    if (data.name === "wc-install") {
        const wasmModule = data.props.module;
        const instantiateWasm = (info, receiveInstance) => {
            info.env = info.env || {};
            WebAssembly.instantiate(wasmModule, info)
                .then((instance) => receiveInstance(instance, wasmModule));
            return; // no-return
        };

        const module = {
            instantiateWasm,
        };

        module.onRuntimeInitialized = () => {
            module.callMain([]);
        };

        new WWORKER(module);
        return;
    }
};

