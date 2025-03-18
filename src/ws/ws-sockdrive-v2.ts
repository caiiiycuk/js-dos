import { Stats } from "../sockdrive/js/src/sockdrive/types";
import { sockdrive, Drive } from "./sockdrive-v2";
import { ReadResponse, Template, WsSockdrive } from "./ws-sockdrive";

export function createSockdrive(
    onOpen: (drive: string, read: boolean, write: boolean, imageSize: number,
        realOwner: string, realDrive: string) => void,
    onError: (e: Error) => void,
    onPreloadProgress: (drive: string, restBytes: number) => void,
    onPayload: (owner: string, drive: string, sectorSize: number,
        aheadRange: number, sectors: number[], row: Uint8Array) => void,
): WsSockdrive {
    const stats: Stats = {
        read: 0,
        write: 0,
        readTotalTime: 0,
        cacheHit: 0,
        cacheMiss: 0,
        cacheUsed: 0,
        io: [],
    };  

    let drive: Drive;


    return {
        stats,
        applyConf(conf: string): void {
            /**/
        },
        applyToken(token: string): void {
            /**/
        },
        async open(url: string, _owner: string, _drive: string, _token: string): Promise<{
            handle: number;
            aheadRange: number;
        }> {
            drive = await sockdrive("https://br.cdn.dos.zone/sockdrive/AoE2");
            onOpen(drive.info.name, true, true, drive.info.size * 1024, _owner, _drive);
            // @TODO: not needed anymore
            // onPayload(_owner, _drive, drive.info.sector_size, drive.info.ahead_read, [], new Uint8Array());
            return {
                handle: 1,
                aheadRange: drive.info.ahead_read / drive.info.sector_size,
            };
        },
        template(handle: number): Template {
            return {
                name: drive.info.name,
                size: drive.info.size,
                heads: drive.info.heads,
                cylinders: drive.info.cylinders,
                sectors: drive.info.sectors,
                sectorSize: drive.info.sector_size,
            };
        },
        readSync(handle: number, sector: number): ReadResponse {
            const range = drive.range(sector);
            const result = drive.readRangeSync(range);
            return {
                buffer: result.data,
                code: result.result,
            };
        },
        async readAsync(handle: number, sector: number): Promise<ReadResponse> {
            const range = drive.range(sector);
            const result = await drive.readRangeAsync(range);
            return {
                buffer: result.data,
                code: result.result,
            };
        },
        write(handle: number, sector: number, buffer: Uint8Array): number {
            return drive.write(sector, buffer);
        },
        close(handle: number): void {
            /**/
        },
    };
}