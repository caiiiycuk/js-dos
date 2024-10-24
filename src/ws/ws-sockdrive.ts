import { Handle, Stats } from "../sockdrive/js/src/sockdrive/types";
import { Drive } from "../sockdrive/js/src/sockdrive/drive";
import { Cache } from "../sockdrive/js/src/sockdrive/cache";
import { sockdriveImgmount } from "../player-api-load";

export interface Template {
    name: string,
    size: number,
    heads: number,
    cylinders: number,
    sectors: number,
    sectorSize: number,
}

export interface ReadResponse {
    buffer?: Uint8Array,
    code: number,
}

export function createSockdrive(
    onOpen: (drive: string, read: boolean, write: boolean, imageSize: number,
        realOwner: string, realDrive: string) => void,
    onError: (e: Error) => void,
    onPreloadProgress: (drive: string, restBytes: number) => void,
    onPayload: (owner: string, drive: string, sectorSize: number,
        aheadRange: number, sectors: number[], row: Uint8Array) => void,
) {
    let seq = 0;
    let token = "";
    const cache: { [backend: string]: Cache } = {};
    const mapping: { [handle: Handle]: Drive } = {};
    const templates: { [handle: number]: Template } = {};
    const memory: { [handle: number]: Uint8Array } = {};
    const stats: Stats = {
        read: 0,
        write: 0,
        readTotalTime: 0,
        cacheHit: 0,
        cacheMiss: 0,
        cacheUsed: 0,
        io: [],
    };
    const sockdrive = {
        stats,
        open: async (url: string, owner: string, name: string, _token: string): Promise<{
            handle: Handle,
            aheadRange: number,
        }> => {
            if (token !== _token) {
                console.error("sockdrive error: token mistmatch", token, "!=", _token);
            }

            const response = await fetch(url.replace("wss://", "https://")
                .replace("ws://", "http://") + "/template/" + owner + "/" + name);
            const template = await response.json();
            if (template.error) {
                throw new Error(template.error);
            }
            seq++;
            templates[seq] = {
                name: template.name,
                size: template.size ?? 0,
                heads: template.heads ?? 1,
                cylinders: template.cylinders ?? 520,
                sectors: template.sectors ?? 63,
                sectorSize: template.sector_size ?? 512,
            };

            const sectorSize = templates[seq].sectorSize;
            const module = { HEAPU8: new Uint8Array(0) };
            stats.io.push({ read: 0, write: 0 });
            const backendCache = cache[url] ?? null;
            if (backendCache) {
                backendCache.open(owner, name, token);
            } else {
                console.error("Sockdrive cache not found for", url);
            }
            mapping[seq] = new Drive(url, owner, name, token, stats, module, backendCache, true);
            return new Promise<{ handle: Handle, aheadRange: number }>((resolve, reject) => {
                const drive = owner + "/" + name;
                mapping[seq].onOpen((read, write, imageSize, aheadRange, realOwner, realDrive) => {
                    memory[seq] = new Uint8Array(sectorSize /* write */ + sectorSize * aheadRange);
                    module.HEAPU8 = memory[seq];
                    onOpen(drive, read, write, imageSize,
                        realOwner, realDrive);
                    resolve({
                        handle: seq,
                        aheadRange,
                    });
                });
                mapping[seq].onError((e) => {
                    onError(e);
                    reject(e);
                });
            });
        },
        read: async (handle: Handle, sector: number): Promise<ReadResponse> => {
            if (mapping[handle]) {
                stats.io[handle - 1].read++;
                const ptr = templates[handle].sectorSize;
                let code = mapping[handle].read(sector, ptr, true) as number;
                if (code = 255) {
                    code = await mapping[handle].read(sector, ptr, false);
                }
                return {
                    code,
                    buffer: memory[handle].slice(ptr),
                };
            }

            console.error("ERROR! sockdrive handle", handle, "not found");
            return Promise.resolve({ code: 1 });
        },
        write: (handle: Handle, sector: number, buffer: Uint8Array): number => {
            if (buffer.byteLength != templates[handle].sectorSize) {
                onError(new Error("sockdrive write buffer size " + buffer.byteLength +
                    " != sector size " + templates[handle].sectorSize));
                return 1;
            }
            if (mapping[handle]) {
                stats.io[handle - 1].write++;
                memory[handle].set(buffer, 0);
                return mapping[handle].write(sector, 0);
            }
            console.error("ERROR! sockdrive handle", handle, "not found");
            return 1;
        },
        close: (handle: Handle) => {
            if (mapping[handle]) {
                mapping[handle].close();
                delete memory[handle];
                delete templates[handle];
                delete mapping[handle];
            }
        },
        template: (handle: Handle) => {
            return templates[handle];
        },
        applyToken: (_token: string) => {
            token = _token;
        },
        applyConf: (conf: string) => {
            console.log("applyConf", conf);
            let m: RegExpExecArray | null;
            while (m = sockdriveImgmount.exec(conf)) {
                /* eslint-disable-next-line no-unused-vars */
                const [_, num, backend, owner, drive] = m;
                if (!cache[backend]) {
                    cache[backend] = new Cache(backend, true);
                }
                cache[backend].onProgress((owner, drive, rest, total) => {
                    onPreloadProgress(owner + "/" + drive, rest);
                });
                cache[backend].onPayload(onPayload);
                cache[backend].open(owner, drive, token);
            }
        },
    };

    return sockdrive;
}
