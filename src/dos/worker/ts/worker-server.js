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

        new WWORKER(module);
        module.then(() => {
            delete module.then;
            module.callMain([]);
        });

        return;
    }

    console.log("Unknown message: " + JSON.stringify(e));
};

