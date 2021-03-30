import { Cache } from "emulators/dist/types/cache";
export declare function resolveBundle(url: string, options?: {
    cache?: Cache | null;
    httpCache?: boolean;
    onprogress?: (progress: number) => void;
}): Promise<Uint8Array>;
