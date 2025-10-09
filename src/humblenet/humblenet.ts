import { NonSerializableStore } from "../store";

declare const HumbleNet: () => any;
declare const HumbleNetImpl: (module: any) => any;

type Peer = {
    peerId: number;
}

export type Net = {
    peerId: number;
    connected: Set<number>;
    wait: (ms: number) => void;
    registerAlias: (alias: string) => Promise<void>;
    unregisterAlias: (alias: string) => void;
    queryAliases: (query: string) => Promise<Peer[]>;
    sendBinary: (data: Uint8Array, peerId: number) => number;
    recvBinary: () => { data: Uint8Array, peerId: number } | null;
    disconnect: (peerId: number) => void;
    shutdown: () => void;
}

async function injectHumbleNet(nonSerializableStore: NonSerializableStore) {
    const url = (nonSerializableStore.options.pathPrefix ?
        nonSerializableStore.options.pathPrefix + "jsapi.mjs" :
        "jsapi.mjs") + (nonSerializableStore.options.pathSuffix ?? "");
    const wasmUrl = (nonSerializableStore.options.pathPrefix ?
        nonSerializableStore.options.pathPrefix + "jsapi.wasm" :
        "jsapi.wasm") + (nonSerializableStore.options.pathSuffix ?? "");

    const jsapi = await (await fetch(url)).text();
    const jsapiURL = URL.createObjectURL(new Blob([jsapi], { type: "text/javascript" }));
    return new Promise<void>((resolve, reject) => {
        if ((window as any).HumbleNet === undefined) {
            const script = document.createElement("script");
            script.type = "module";


            script.text = `
import HumbleNet from "${jsapiURL}";
window.HumbleNetImpl = HumbleNet;
`;


            script.onerror = reject;
            document.body.appendChild(script);

            const intervalId = setInterval(() => {
                if ((window as any).HumbleNetImpl !== undefined) {
                    clearInterval(intervalId);
                    URL.revokeObjectURL(jsapiURL);

                    (window as any).HumbleNet = () => {
                        /* eslint-disable-next-line new-cap */
                        return HumbleNetImpl({
                            locateFile: (path: string) => (path.endsWith(".wasm") ? wasmUrl : path),
                        });
                    };
                    resolve();
                }
            }, 1000);
        } else {
            resolve();
        }
    });
}

export async function createNet(url: string, token: string, secret: string,
                                onNetworkError: (peerId: number) => void,
                                onDisconnect: () => void,
                                nonSerializableStore: NonSerializableStore,
) {
    await injectHumbleNet(nonSerializableStore);

    /* eslint-disable-next-line new-cap */
    const lib = await HumbleNet();
    lib.onNetworkError = onNetworkError;

    const withStr = (str: string, callback: (ptr: number, size: number) => void) => {
        const size = lib.lengthBytesUTF8(str) + 1;
        const ptr = lib.stringToNewUTF8(str);
        callback(ptr, size);
        lib._free(ptr);
    };

    const withBuffer = (buffer: Uint8Array, callback: (ptr: number, size: number) => number) => {
        const size = buffer.byteLength;
        const ptr = lib._malloc(size);
        lib.HEAPU8.set(buffer, ptr);
        const response = callback(ptr, size);
        lib._free(ptr);
        return response;
    };

    const pendingQueries: {
        [query: string]: {
            promise: Promise<{ alias: string, peerId: number }[]>,
            matches: { alias: string, peerId: number }[],
            resolve: (matches: { alias: string, peerId: number }[]) => void
        }
    } = {};

    lib.aliasQueryAdd = (query: string, alias: string, peerId: number) => {
        pendingQueries[query].matches.push({ alias, peerId });
    };

    lib.onAliasQueryEnd = (query: string) => {
        pendingQueries[query].resolve(pendingQueries[query].matches);
        delete pendingQueries[query];
    };

    return new Promise<Net>((resolve, reject) => {
        withStr(url, (urlPtr) => {
            withStr(token, (tokenPtr) => {
                withStr(secret, (secretPtr) => {
                    try {
                        if (lib._connectTo(urlPtr, tokenPtr, secretPtr)) {
                            const recvLength = 4096 * 1024;
                            const recvBuffer = lib._malloc(recvLength);
                            const recvPeerId = lib._malloc(4);
                            const net: Net & { lib: any } = {
                                lib,
                                peerId: 0,
                                connected: new Set(),
                                wait: (ms: number) => {
                                    lib._wait(ms);
                                },
                                registerAlias: (alias: string) => {
                                    if (lib.pendingRegister) {
                                        return Promise.reject(new Error("Register already in progress"));
                                    }

                                    lib.pendingRegister = new Promise<void>((resolve, reject) => {
                                        withStr(alias, (aliasPtr) => {
                                            lib._registerAlias(aliasPtr);
                                        });

                                        net.queryAliases("=" + alias)
                                            .then((aliases) => {
                                                if (aliases.length === 1 && aliases[0].peerId === net.peerId) {
                                                    resolve();
                                                } else {
                                                    reject(new Error("Alias already in use"));
                                                }
                                            })
                                            .catch(reject);
                                    });


                                    return lib.pendingRegister.finally(() => {
                                        lib.pendingRegister = null;
                                    });
                                },
                                unregisterAlias: (alias: string) => {
                                    withStr(alias, (aliasPtr) => {
                                        lib._unregisterAlias(aliasPtr);
                                    });
                                },
                                queryAliases: (query: string) => {
                                    if (pendingQueries[query] !== undefined) {
                                        return pendingQueries[query].promise;
                                    }

                                    pendingQueries[query] = {
                                        matches: [],
                                    } as any;
                                    pendingQueries[query].promise = new Promise<{ alias: string, peerId: number }[]>(
                                        (resolve) => {
                                            pendingQueries[query].resolve = resolve;

                                            withStr(query, (queryPtr) => {
                                                lib._queryAliases(queryPtr);
                                            });
                                        });

                                    return pendingQueries[query].promise;
                                },
                                sendBinary: (data: Uint8Array, peerId: number) => {
                                    if (peerId === net.peerId || peerId === 0) {
                                        throw new Error("Cannot send to self (" + peerId + ")");
                                    }
                                    net.connected.add(peerId);
                                    return withBuffer(data, (ptr, size) => {
                                        return lib._sendto(ptr, size, peerId, 0);
                                    });
                                },
                                recvBinary: () => {
                                    const ret = lib._recvfrom(recvBuffer, recvLength, recvPeerId);
                                    const peerId = lib.HEAP32[recvPeerId / 4];
                                    if (ret < 0) {
                                        if (peerId !== 0) {
                                            net.connected.delete(peerId);
                                        }
                                        return null;
                                    } else if (ret > 0) {
                                        net.connected.add(peerId);
                                        return { data: lib.HEAPU8.slice(recvBuffer, recvBuffer + ret), peerId };
                                    } else {
                                        return null;
                                    }
                                },
                                disconnect: (peerId: number) => {
                                    lib._disconnect(peerId);
                                },
                                shutdown: () => {
                                    try {
                                        lib._shutdown();
                                    } catch (e) {
                                        // ignore
                                    }
                                },
                            };

                            (window as any).net = net;

                            const intervalId = setInterval(() => {
                                net.peerId = lib._myId();
                                if (net.peerId !== 0) {
                                    clearInterval(intervalId);
                                    resolve(net);

                                    const disconnectCheckId = setInterval(() => {
                                        if (lib._myId() === 0) {
                                            onDisconnect();
                                            clearInterval(disconnectCheckId);
                                        }
                                    }, 1000);
                                }
                                net.wait(4);
                            }, 30);
                        } else {
                            reject(new Error("Failed to connect to HumbleNet"));
                        }
                    } catch (e) {
                        reject(e);
                    }
                });
            });
        });
    });
}
