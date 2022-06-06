export declare function resolveBundle(url: string, options?: {
    httpCache?: boolean;
    onprogress?: (progress: number) => void;
}): Promise<Uint8Array>;
