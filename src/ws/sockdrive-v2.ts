/* eslint-disable no-unused-vars */
export enum OpResult {
    OK = 0,
    ERR = 1,
    AGAIN = 255,
}
/* eslint-enable no-unused-vars */

interface OpReadResult {
    result: OpResult;
    data?: Uint8Array;
}

interface DriveInfo {
    ahead_read: number;
    range_count: number;
    dropped_ranges: number[];
    preload_ranges: number[] | "_";
    cylinders: number;
    heads: number;
    sectors: number;
    sector_size: number;
    size: number;
    name: string;
}

export interface Drive {
    info: DriveInfo;
    range(sector: number): number;
    readRangeSync(range: number): OpReadResult;
    readRangeAsync(range: number): Promise<OpReadResult>;
    write(sector: number, data: Uint8Array): OpResult;
}

export async function sockdrive(url: string): Promise<Drive> {
    const response = await fetch(url + "/sockdrive.metaj");
    const info = await response.json() as DriveInfo;
    const cache = new Map<number, Uint8Array>();
    const sectors = new Map<number, Map<number, Uint8Array>>();
    const empty = new Uint8Array(info.ahead_read);

    const dropped = new Set<number>();
    for (const next of info.dropped_ranges) {
        dropped.add(next);
    }

    function mergeSectorsData(range: number, data: Uint8Array): Uint8Array {
        if (sectors.has(range)) {
            const merged = data.slice();
            for (const [offset, data] of sectors.get(range)!.entries()) {
                merged.set(data, offset * info.sector_size);
            }
            return merged;
        } else {
            return data;
        }
    }

    function range(sector: number) {
        return Math.floor(sector * info.sector_size / info.ahead_read);
    };

    return {
        info,
        range,
        readRangeSync: (range: number) => {
            if (dropped.has(range)) {
                return {
                    result: OpResult.OK,
                    data: mergeSectorsData(range, empty),
                };
            } else if (cache.has(range)) {
                return {
                    result: OpResult.OK,
                    data: mergeSectorsData(range, cache.get(range)!),
                };
            } else {
                return {
                    result: OpResult.AGAIN,
                };
            }
        },
        readRangeAsync: async (range: number) => {
            try {
                if (cache.has(range)) {
                    throw new Error("Can't read range " + range + ", it's cached");
                }
                if (dropped.has(range)) {
                    throw new Error("Can't read range " + range + ", it's dropped");
                }
                const response = await fetch(url + "/" + range + ".raw");
                if (!response.ok) {
                    throw new Error("Can't read range " + range + ", netowrk response code is " + response.status);
                }
                const data = new Uint8Array(await response.arrayBuffer());
                cache.set(range, data);
                return {
                    result: OpResult.OK,
                    data: mergeSectorsData(range, data),
                };
            } catch (e) {
                console.error("Can't read range", range, e);
                return {
                    result: OpResult.ERR,
                };
            }
        },
        write: (sector: number, data: Uint8Array) => {
            const rangeOfSector = range(sector);
            if (!sectors.has(rangeOfSector)) {
                sectors.set(rangeOfSector, new Map());
            }
            sectors.get(rangeOfSector)!.set(
                sector - (rangeOfSector * info.ahead_read) / info.sector_size, 
                data.slice(0, info.sector_size));
            return OpResult.OK;
        },
    };
}
