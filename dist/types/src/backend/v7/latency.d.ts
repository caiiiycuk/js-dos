export interface LatencyInfo {
    region: string;
    regionLatency: number;
    estimation: {
        [region: string]: number[];
    };
}
export declare function getAutoRegion(onLatencyUpdate: (region: string) => void): Promise<LatencyInfo>;
