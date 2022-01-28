import { AwsRegion, awsRegions } from "../v7/v7-config";

export interface LatencyInfo {
    region: string,
    regionLatency: number,
    estimation: {[region: string]: number[]},
}

const withTimeout = (fn: () => Promise<void>, region: string, timeoutMs: number) => {
    return new Promise<void>((resolve) => {
        const id = setTimeout(() => {
            console.error("Timeout while latency check for ", region);
            resolve();
        }, timeoutMs);

        fn().then(() => {
            clearTimeout(id);
            resolve();
        }).catch((e) => {
            console.error("Error while latency check for ", region, e);
            clearTimeout(id);
            resolve();
        });
    });
};

export async function getAutoRegion(onLatencyUpdate: (region: string) => void): Promise<LatencyInfo> {
    const regions = [...awsRegions];
    const regionLatency: { [region: string]: number[] } = (() => {
        const latency: { [region: string]: number[] } = {};
        for (const { name: value } of awsRegions) {
            latency[value] = [];
        }
        return latency;
    })();

    // estimation
    const delayed: Promise<void>[] = [];
    for (const region of regions) {
        const checkOne = async () => {
            const name = region.name;

            for (let i = 0; i < 5; ++i) {
                regionLatency[name].push(await getLatencyForRegionWithFetch(region));
                onLatencyUpdate(name + "#" + (i+1) + " (" + regionLatency[name][0] + " ms)");
            }
        };

        delayed.push(withTimeout(checkOne, region.name, 15000));
    }

    await Promise.all(delayed);

    // adding preformance data if can
    try {
        const regionRegExp = /execute-api\.([^.]+)\.amazonaws.com\/dev\/ok/;
        if (typeof performance !== "undefined" && typeof performance.getEntriesByType !== "undefined") {
            const resources = performance.getEntriesByType("resource");
            for (const resource of resources) {
                if (resource.name !== undefined && resource.duration !== undefined) {
                    const matches = regionRegExp.exec(resource.name);
                    if (matches !== null && matches[1] !== undefined) {
                        regionLatency[matches[1]].push(Math.round(resource.duration));
                    }
                }
            }
        }
    } catch (e) {
        console.error("Can't use performance data", e);
    }

    let region = "eu-central-1";
    let minLatency = -1;
    let debugInfo = "";
    const estimation: {[region: string]: number[]} = {};
    for (const next of Object.keys(regionLatency)) {
        const latency = min(regionLatency[next]);
        if (latency > 0 && (minLatency === -1 || minLatency > latency)) {
            region = next;
            minLatency = latency;
        }
        const sorted = asc(regionLatency[next]);
        estimation[next] = sorted;
        debugInfo += (next + "         ").substring(0, 14) + ": [" +
            sorted.join(", ") + "]\n";
    }

    console.log("Latency estimation:\n" + debugInfo);
    console.log("Auto region:", region, ", latency: " + minLatency);

    return {
        region,
        regionLatency: minLatency,
        estimation,
    };
}

async function getLatencyForRegionWithFetch(region: AwsRegion) {
    const okUrl = region.ok;
    if (okUrl.indexOf(region.name) === -1) {
        throw new Error("okUrl " + okUrl + " does not contain region " + region);
    }

    const estimateTime = async () => {
        const startedAt = Date.now();

        await fetch(okUrl + "?time=" + startedAt, {
            method: "GET",
            mode: "cors",
            cache: "no-cache",
        }).then((r) => r.text());

        return Date.now() - startedAt;
    };

    return estimateTime();
}

const asc = (arr: number[]) => arr.sort((a, b) => a - b);

const min = (arr: number[]) => {
    if (arr.length === 0) {
        return 0;
    }

    return asc(arr)[0];
};
