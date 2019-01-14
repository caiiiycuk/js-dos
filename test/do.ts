// Do
// ==
// We use this functions to avoid problem of throwing,
// exceptions inside promise.
// Mocha can't handle exceptions if they are throwed in promise

export function doThen<T>(promise: Promise<T>, fn: (v: T) => void) {
    promise.then((v: T) => {
        const topFn = () => {
            fn(v);
        };

        setTimeout(topFn, 1);
    });
}

export function doCatch<T>(promise: Promise<T>, fn: (v: string) => void) {
    promise.catch((v: string) => {
        const topFn = () => {
            fn(v);
        };

        setTimeout(topFn, 1);
    });
}