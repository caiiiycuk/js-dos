import { Handle, Stats } from "../sockdrive/js/src/sockdrive/types";
import { Drive } from "../sockdrive/js/src/sockdrive/drive";

interface Template {
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
    onOpen: (drive: string, read: boolean, write: boolean) => void,
    onError: (e: Error) => void) {
    let seq = 0;
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
    };
    const sockdrive = {
        stats,
        open: async (url: string, owner: string, name: string, token: string, aheadRange: number): Promise<Handle> => {
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
            memory[seq] = new Uint8Array(sectorSize + sectorSize * aheadRange);
            mapping[seq] = new Drive(url, owner, name, token, stats,
                { HEAPU8: memory[seq] }, sectorSize, aheadRange, sectorSize, 1); // cache is on server
            mapping[seq].onOpen((read, write) => {
                onOpen(owner + "/" + name, read, write);
            });
            mapping[seq].onError(onError);
            return seq;
        },
        read: (handle: Handle, sector: number): Promise<ReadResponse> => {
            if (mapping[handle]) {
                return (mapping[handle].read(sector, 0, false) as Promise<number>).then((code) => {
                    return {
                        code,
                        buffer: memory[handle].slice(templates[seq].sectorSize),
                    };
                });
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
    };

    return sockdrive;
}
