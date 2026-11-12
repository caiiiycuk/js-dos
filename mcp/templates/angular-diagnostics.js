const rejection = Zone.__symbol__("unhandledPromiseRejectionHandler");
const previous = Zone[rejection];
// SAFETY: ZoneAwarePromise rejection reporting does not use the native Promise event path.
Zone[rejection] = function(error) {
    window.dispatchEvent(new CustomEvent("jsdos-diagnostics-unhandled", { detail: String(error.rejection) }));
    return previous?.call(this, error);
};
