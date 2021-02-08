const { performance } = require('perf_hooks');
const dhry2 = require("./dhry2.js");

const startedAt = performance.now();
const Module = {
	log: console.log,
	performance,
	onRuntimeInitialized: () => {
		console.log("Runtime initialized after", performance.now() - startedAt, "ms");
		Module.callMain([]);
	},
};

dhry2(Module);
