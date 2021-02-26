import { Cache } from "emulators/dist/types/cache";
export declare function resolveBundle(url: string, options?: {
    cache?: Cache | null;
    onprogress?: (progress: number) => void;
}): Promise<Uint8Array>;
